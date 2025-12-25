// scripts/theia-bot.ts
/**
 * Theia iMessage bot entrypoint
 *
 * This script wires up:
 *  - Advanced iMessage Kit SDK initialization + connection
 *  - inbound message listener
 *  - message routing through the relay manager
 *
 * Keep this file runnable via: `npm run bot`
 */

import 'dotenv/config'

// Advanced iMessage Kit SDK
// (the package name and exports are provided by dependencies in this repo)
import {
  createClient,
  type Client,
  type IncomingMessage,
} from 'advanced-imessage-kit'

import { RelayManager } from '../lib/relay/relay-manager'

// Ensure we keep Gateway usage via lib/ai/gateway.ts (RelayManager depends on it)

function requiredEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing required env var: ${name}`)
  return v
}

async function main() {
  const logPrefix = '[theia-bot]'

  // SDK init
  const client: Client = createClient({
    // Common auth/config vars used by Advanced iMessage Kit
    // (kept flexible so repo-specific env naming can be mapped in SDK)
    apiKey: process.env.IMESSAGE_API_KEY ?? process.env.AIMK_API_KEY,
    endpoint: process.env.IMESSAGE_ENDPOINT ?? process.env.AIMK_ENDPOINT,
    deviceId: process.env.IMESSAGE_DEVICE_ID ?? process.env.AIMK_DEVICE_ID,
  })

  // Relay manager
  const relay = new RelayManager({
    aiGatewayBaseUrl: process.env.AI_GATEWAY_BASE_URL,
    aiGatewayApiKey: process.env.AI_GATEWAY_API_KEY,
  })

  // Connect
  await client.connect({
    // Some SDKs require a session token; support both names
    sessionToken: process.env.IMESSAGE_SESSION_TOKEN ?? process.env.AIMK_SESSION_TOKEN,
    // Some SDKs require account/udid; allow optional
    account: process.env.IMESSAGE_ACCOUNT,
  })

  // Listen + route inbound messages
  client.on('new-message', async (msg: IncomingMessage) => {
    try {
      await relay.handleIncomingMessage({
        platform: 'imessage',
        conversationId: msg.conversationId ?? msg.chatId ?? requiredEnv('IMESSAGE_DEFAULT_CONVERSATION_ID'),
        senderId: msg.senderId ?? msg.from,
        text: msg.text ?? msg.body ?? '',
        raw: msg,
        reply: async (text: string) => {
          // Prefer reply helpers if present
          if (typeof (msg as any).reply === 'function') {
            return (msg as any).reply(text)
          }
          return client.sendMessage({
            conversationId: msg.conversationId ?? msg.chatId,
            text,
          })
        },
      })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`${logPrefix} Error handling message`, err)
    }
  })

  // eslint-disable-next-line no-console
  console.log(`${logPrefix} Connected and listening for new messages`) 
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[theia-bot] Fatal error', err)
  process.exit(1)
})

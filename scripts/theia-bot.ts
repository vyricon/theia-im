#!/usr/bin/env node
/**
 * Theia Smart Relay Bot
 * Uses Advanced iMessage Kit - connects to server at localhost:1234
 */

import { SDK } from '@photon-ai/advanced-imessage-kit';
import { supabase } from '../lib/supabase/client';
import { RelayManager } from '../lib/relay/relay-manager';

const YOUR_PHONE = process.env.YOUR_PHONE_NUMBER;
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:1234';
const API_KEY = process.env.API_KEY;

if (!YOUR_PHONE) {
  console.error('❌ YOUR_PHONE_NUMBER required');
  process.exit(1);
}

// Create SDK instance like the examples
const sdk = SDK({
  serverUrl: SERVER_URL,
  apiKey: API_KEY,
  logLevel: 'info',
});

const relayManager = new RelayManager(YOUR_PHONE, supabase);

console.log('🤖 Theia Smart Relay Bot');
console.log(`📱 Phone: ${YOUR_PHONE}`);
console.log(`🔗 Server: ${SERVER_URL}\n`);

sdk.on('ready', async () => {
  console.log('✅ Connected and ready');
  await relayManager.initializeUser();
});

sdk.on('new-message', async (message) => {
  try {
    // Skip empty messages
    if (!message.text) {
      return;
    }

    console.log(`\n📨 New message: ${message.text.substring(0, 50)}...`);

    // Get chatGuid from message (use the first chat)
    const chat = message.chats?.[0];
    if (!chat) {
      console.log('⚠️ No chat found for message, skipping');
      return;
    }
    const chatGuid = chat.guid;

    // ============================================
    // SCENARIO 1: Message FROM YOU (Relay Mode)
    // ============================================
    if (relayManager.isFromYou(message)) {
      console.log(`📤 Message from you: ${message.text}`);

      // Check for status commands
      if (message.text.startsWith('/status')) {
        const parts = message.text.trim().split(/\s+/);

        if (parts[1] === 'check') {
          const status = await relayManager.getStatus();
          await sdk.messages.sendMessage({
            chatGuid,
            message: `Current status: ${status}`,
          });
          console.log(`✅ Sent status: ${status}`);
          return;
        }

        if (
          parts[1] &&
          ['available', 'busy', 'away', 'sleep', 'dnd'].includes(parts[1])
        ) {
          await relayManager.setStatus(parts[1] as any);
          await sdk.messages.sendMessage({
            chatGuid,
            message: `✅ Status set to: ${parts[1]}`,
          });
          console.log(`✅ Status changed to: ${parts[1]}`);
          return;
        }

        await sdk.messages.sendMessage({
          chatGuid,
          message: '❌ Invalid status command. Use: /status [available|busy|away|sleep|dnd|check]',
        });
        return;
      }

      // Check for digest command
      if (message.text.startsWith('/digest')) {
        console.log('📊 Generating digest...');
        const digest = await relayManager.getDigest(2);
        await sdk.messages.sendMessage({
          chatGuid,
          message: digest,
        });
        console.log('✅ Digest sent');
        return;
      }

      // Check for relay commands
      const relayCommand = relayManager.parseRelayCommand(message.text);

      if (relayCommand) {
        console.log(`🔄 Relay command detected: ${relayCommand.type}`);

        if (relayCommand.type === 'reply') {
          // Get last sender for reply
          const lastSender = await relayManager.getLastSender();
          if (lastSender) {
            // Build chatGuid for target
            const targetChatGuid = `iMessage;-;${lastSender}`;
            await sdk.messages.sendMessage({
              chatGuid: targetChatGuid,
              message: relayCommand.message,
            });
            await sdk.messages.sendMessage({
              chatGuid,
              message: `✅ Sent to ${lastSender}`,
            });
            await relayManager.logRelay({
              conversation_id: crypto.randomUUID(),
              from_user: YOUR_PHONE,
              to_user: lastSender,
              original_text: relayCommand.message,
              relayed_text: relayCommand.message,
              relay_method: 'manual',
              was_auto_responded: false,
              is_urgent: false,
            });
            console.log(`✅ Reply sent to ${lastSender}`);
          } else {
            await sdk.messages.sendMessage({
              chatGuid,
              message: '❌ No recent conversation to reply to',
            });
            console.log('❌ No recent conversation found');
          }
          return;
        }

        if (relayCommand.type === 'send') {
          // Build chatGuid for target
          const targetChatGuid = `any;-;${relayCommand.target}`;
          await sdk.messages.sendMessage({
            chatGuid: targetChatGuid,
            message: relayCommand.message,
          });
          await sdk.messages.sendMessage({
            chatGuid,
            message: `✅ Sent to ${relayCommand.target}`,
          });
          await relayManager.logRelay({
            conversation_id: crypto.randomUUID(),
            from_user: YOUR_PHONE,
            to_user: relayCommand.target,
            original_text: relayCommand.message,
            relayed_text: relayCommand.message,
            relay_method: 'manual',
            was_auto_responded: false,
            is_urgent: false,
          });
          console.log(`✅ Message sent to ${relayCommand.target}`);
          return;
        }
      }

      // Otherwise, normal conversation with Theia
      console.log('💬 Normal message to Theia (not a relay command)');
    }

    // ============================================
    // SCENARIO 2: Message FROM CONTACT
    // ============================================
    else {
      const sender = message.handle?.address || 'unknown';
      console.log(`📨 Message from ${sender}: ${message.text}`);

      const isUrgent = relayManager.detectUrgency(message.text);

      // Always relay urgent messages
      if (isUrgent) {
        console.log('🚨 URGENT message detected - relaying immediately');
        const yourChatGuid = `any;-;${YOUR_PHONE}`;
        const urgentMsg = `🚨 URGENT from ${sender}:\n"${message.text}"`;
        await sdk.messages.sendMessage({
          chatGuid: yourChatGuid,
          message: urgentMsg,
        });
        await relayManager.logRelay({
          conversation_id: crypto.randomUUID(),
          from_user: sender,
          to_user: YOUR_PHONE,
          original_text: message.text,
          relayed_text: urgentMsg,
          relay_method: 'urgent',
          was_auto_responded: false,
          is_urgent: true,
        });
        console.log('✅ Urgent message relayed');
        return;
      }

      // Check if should auto-respond
      const shouldAutoRespond = await relayManager.shouldAutoRespond(message);

      if (shouldAutoRespond) {
        // Auto-respond mode
        console.log(`🤖 Auto-responding to ${sender}...`);

        const autoResponse = await relayManager.generateAutoResponse(message);
        
        // Send auto-response to contact
        await sdk.messages.sendMessage({
          chatGuid: message.chatGuid,
          message: autoResponse,
        });

        // Notify you
        const yourChatGuid = `any;-;${YOUR_PHONE}`;
        const notification = `✅ Auto-responded to ${sender}:\n\nTheir message:\n"${message.text}"\n\nMy response:\n"${autoResponse}"`;
        await sdk.messages.sendMessage({
          chatGuid: yourChatGuid,
          message: notification,
        });

        await relayManager.logRelay({
          conversation_id: crypto.randomUUID(),
          from_user: sender,
          to_user: sender,
          original_text: message.text,
          relayed_text: autoResponse,
          relay_method: 'auto',
          was_auto_responded: true,
          is_urgent: false,
        });
        console.log('✅ Auto-response sent and logged');
      } else {
        // Relay mode - forward to you
        console.log(`🔄 Relaying to you from ${sender}`);
        const yourChatGuid = `any;-;${YOUR_PHONE}`;
        const formattedMessage = `📨 From ${sender}:\n"${message.text}"\n\nReply with: Reply: [your message]`;

        await sdk.messages.sendMessage({
          chatGuid: yourChatGuid,
          message: formattedMessage,
        });

        await relayManager.logRelay({
          conversation_id: crypto.randomUUID(),
          from_user: sender,
          to_user: YOUR_PHONE,
          original_text: message.text,
          relayed_text: formattedMessage,
          relay_method: 'manual',
          was_auto_responded: false,
          is_urgent: false,
        });
        console.log('✅ Message relayed to you');
      }
    }
  } catch (error) {
    console.error('❌ Error processing message:', error);
    const errorMsg = `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    
    try {
      const yourChatGuid = `any;-;${YOUR_PHONE}`;
      await sdk.messages.sendMessage({
        chatGuid: yourChatGuid,
        message: errorMsg,
      });
    } catch (e) {
      console.error('Failed to send error message:', e);
    }
  }
});

// Handle errors
sdk.on('error', (error: Error) => {
  console.error('❌ SDK error:', error);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down Theia...');
  await sdk.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down Theia...');
  await sdk.close();
  process.exit(0);
});

// Keep process alive
process.stdin.resume();

// Connect to server (like the examples)
await sdk.connect();

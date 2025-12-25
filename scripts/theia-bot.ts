// scripts/theia-bot.ts
// Smart Relay Mode bot logic

import { z } from 'zod';
import { createSupabaseServerClient } from '../src/lib/supabase/client';
import crypto from 'crypto';
import { RelayManager } from '../src/relay/RelayManager';

// NOTE: This file intentionally avoids using message.chatGuid.
// For contact replies we derive chatGuid from message.chats[0].guid.

type IncomingMessage = {
  from: { handle: string; displayName?: string };
  text?: string;
  // chats array exists for messages where iMessage provides conversation context
  chats?: Array<{ guid: string }>;
  // other fields omitted
};

// Validate environment on module load
const BotEnvSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

const env = BotEnvSchema.parse({
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
});

const supabase = createSupabaseServerClient();

function assertChatGuidForContactReply(message: IncomingMessage): string {
  const guid = message?.chats?.[0]?.guid;
  if (!guid) {
    throw new Error('Missing chat GUID for contact reply (expected message.chats[0].guid).');
  }
  return guid;
}

function isHenry(handle: string): boolean {
  return (handle || '').toLowerCase().includes('henry');
}

function normalizeCmd(text: string): string {
  return (text || '').trim();
}

async function getLatestPendingDraft(contactHandle: string) {
  const { data, error } = await supabase
    .from('theia_pending_drafts')
    .select('*')
    .eq('contact_handle', contactHandle)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function upsertPendingDraft(args: {
  contact_handle: string;
  chat_guid: string;
  draft_body: string;
  context: string | null;
  expires_at: string;
}) {
  const { data, error } = await supabase
    .from('theia_pending_drafts')
    .insert(args)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

async function cancelLatestPendingDraft(contactHandle: string) {
  const latest = await getLatestPendingDraft(contactHandle);
  if (!latest) return null;
  const { error } = await supabase
    .from('theia_pending_drafts')
    .delete()
    .eq('id', latest.id);
  if (error) throw error;
  return latest;
}

function utcStamp(date = new Date()) {
  // YYYY-MM-DD HH:MM:SS UTC
  const iso = date.toISOString().replace('T', ' ').replace('Z', '');
  return `${iso} UTC`;
}

function utcRef(date = new Date()) {
  // THA-RLY-HEN-YYYYMMDD-HHMMSS-8CHAR
  const pad2 = (n: number) => String(n).padStart(2, '0');
  const y = date.getUTCFullYear();
  const m = pad2(date.getUTCMonth() + 1);
  const d = pad2(date.getUTCDate());
  const hh = pad2(date.getUTCHours());
  const mm = pad2(date.getUTCMinutes());
  const ss = pad2(date.getUTCSeconds());
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `THA-RLY-HEN-${y}${m}${d}-${hh}${mm}${ss}-${rand}`;
}

function wrapTheiaOS(bodyOnly: string, now = new Date()) {
  const header = '♡';
  const footer = `${utcStamp(now)} | ref ${utcRef(now)}`;
  return `${header}\n${bodyOnly.trim()}\n\n${footer}`;
}

const DRAFT_TTL_MINUTES = Number(process.env.THEIA_DRAFT_TTL_MINUTES || '120');

function calcExpiry(now = new Date()) {
  return new Date(now.getTime() + DRAFT_TTL_MINUTES * 60_000).toISOString();
}

// Main message handler (hooked up elsewhere in runtime)
export async function handleIncomingMessage(message: IncomingMessage) {
  try {
    const fromHandle = message.from?.handle;
    const text = message.text || '';

    console.log(`📨 Processing message from ${fromHandle}`);

    // Henry controls send policy via natural language
    if (isHenry(fromHandle)) {
      const cmd = normalizeCmd(text).toLowerCase();
      if (cmd.includes('go yolo')) {
        await RelayManager.setSendPolicy(supabase, 'yolo');
        console.log('✅ Set send policy to YOLO');
        return;
      }
      if (cmd.includes('stop yolo')) {
        await RelayManager.setSendPolicy(supabase, 'draft');
        console.log('✅ Set send policy to DRAFT');
        return;
      }
    }

    // Contact messages: generate draft or send depending on policy
    const chatGuid = assertChatGuidForContactReply(message);

    const directive = await RelayManager.getDirective(supabase);

    // Commands that operate on latest pending draft
    const trimmed = normalizeCmd(text);
    const lower = trimmed.toLowerCase();
    const isSend = lower === 'send';
    const isCancel = lower === 'cancel';
    const isEdit = lower.startsWith('edit:');

    if (isSend || isCancel || isEdit) {
      const latest = await getLatestPendingDraft(fromHandle);
      if (!latest) {
        console.log('ℹ️  No pending draft found');
        return;
      }

      if (isCancel) {
        await cancelLatestPendingDraft(fromHandle);
        console.log('✅ Draft cancelled');
        return;
      }

      let body = latest.draft_body;
      if (isEdit) {
        const editText = trimmed.slice('edit:'.length).trim();
        // Replace the draft body with the user-provided edited text (model not used)
        body = editText;
        // Write a new pending draft version
        await upsertPendingDraft({
          contact_handle: fromHandle,
          chat_guid: chatGuid,
          draft_body: body,
          context: latest.context || directive.context || null,
          expires_at: calcExpiry(),
        });
        console.log('✅ Draft edited');
      }

      if (isSend) {
        // send the latest draft (or edited) as TheiaOS format
        const outbound = wrapTheiaOS(body);
        await RelayManager.sendToContact({ chatGuid, text: outbound });
        await cancelLatestPendingDraft(fromHandle);
        console.log('✅ Message sent');
        return;
      }

      return;
    }

    // Normal contact inbound message; generate body-only draft via model
    const draftBody = await RelayManager.generateDraftBodyForContact({
      supabase,
      contactHandle: fromHandle,
      incomingText: text,
      directive,
    });

    // Enforce body constraints: max 6 lines, no emoji (best-effort)
    const safeBody = draftBody
      .split(/\r?\n/)
      .slice(0, 6)
      .join('\n')
      .replace(/[\p{Extended_Pictographic}]/gu, '');

    if (directive.send_policy === 'yolo') {
      const outbound = wrapTheiaOS(safeBody);
      await RelayManager.sendToContact({ chatGuid, text: outbound });
      console.log('✅ Auto-sent (YOLO mode)');
      return;
    }

    // draft unless go yolo
    await upsertPendingDraft({
      contact_handle: fromHandle,
      chat_guid: chatGuid,
      draft_body: safeBody,
      context: directive.context || null,
      expires_at: calcExpiry(),
    });
    console.log('✅ Draft created');
  } catch (error) {
    console.error('❌ Error handling message:', error);
    throw error;
  }
}

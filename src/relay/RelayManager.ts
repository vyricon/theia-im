// src/relay/RelayManager.ts

import type { SupabaseClient } from '@supabase/supabase-js';

export type SendPolicy = 'draft' | 'yolo';

export type RelayDirective = {
  status: string | null;
  send_policy: SendPolicy;
  context: string | null;
};

export class RelayManager {
  // Fetch status + send_policy + context as a single directive
  static async getDirective(supabase: SupabaseClient): Promise<RelayDirective> {
    const { data, error } = await supabase
      .from('theia_user_status')
      .select('status,send_policy,context')
      .limit(1)
      .maybeSingle();
    if (error) throw error;

    return {
      status: data?.status ?? null,
      send_policy: (data?.send_policy as SendPolicy) ?? 'draft',
      context: data?.context ?? null,
    };
  }

  static async setSendPolicy(supabase: SupabaseClient, send_policy: SendPolicy) {
    // Ensure we have a row; update the first row if present, else insert.
    const { data: existing, error: selErr } = await supabase
      .from('theia_user_status')
      .select('id')
      .limit(1)
      .maybeSingle();
    if (selErr) throw selErr;

    if (existing?.id) {
      const { error } = await supabase
        .from('theia_user_status')
        .update({ send_policy })
        .eq('id', existing.id);
      if (error) throw error;
      return;
    }

    const { error } = await supabase.from('theia_user_status').insert({ send_policy });
    if (error) throw error;
  }

  // Model produces body only (max 6 lines, no emoji) based on directive + inbound text.
  static async generateDraftBodyForContact(args: {
    supabase: SupabaseClient;
    contactHandle: string;
    incomingText: string;
    directive: RelayDirective;
  }): Promise<string> {
    const { incomingText, directive } = args;

    // Placeholder: integrate with your LLM provider / prompt logic.
    // Keep it body-only and concise.
    const context = directive.context ? `Context: ${directive.context}\n` : '';
    const status = directive.status ? `Status: ${directive.status}\n` : '';

    const seed = `${context}${status}Incoming: ${incomingText}`.trim();

    // Minimal deterministic fallback if no model wired.
    // In repo environments with model integration, replace this with actual call.
    return seed.split(/\r?\n/).slice(0, 6).join('\n');
  }

  // This should be implemented by existing messaging transport in the repo.
  static async sendToContact(args: { chatGuid: string; text: string }) {
    // Implemented elsewhere in your runtime; this is a thin interface.
    // eslint-disable-next-line no-console
    console.log('sendToContact', args.chatGuid, args.text);
  }
}

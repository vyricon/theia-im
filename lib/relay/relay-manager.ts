import { SupabaseClient } from '@supabase/supabase-js';
import { generateText } from 'ai';
import { getModel } from '../ai/gateway';
import {
  UserStatus,
  RelayCommand,
  AdvancedMessage,
  RelayMessageType,
  URGENT_KEYWORDS,
  STATUS_MESSAGES,
  UserStatusSchema,
  RelayMessageSchema,
} from '../types/relay';

/**
 * RelayManager - Core class for managing message relay and auto-respond logic
 * Uses modern AI SDK v4 with Provider Registry
 */
export class RelayManager {
  constructor(
    private yourPhone: string,
    private supabase: SupabaseClient
  ) {}

  /**
   * Check if message is from you
   */
  isFromYou(msg: AdvancedMessage): boolean {
    return msg.isFromMe || msg.sender === this.yourPhone;
  }

  /**
   * Get your current status
   */
  async getStatus(): Promise<UserStatus> {
    try {
      const { data, error } = await this.supabase
        .from('theia_user_status')
        .select('status')
        .eq('user_phone', this.yourPhone)
        .single();

      if (error) {
        console.warn('Error fetching status, defaulting to available:', error);
        return 'available';
      }

      const parsed = UserStatusSchema.safeParse(data);
      return parsed.success ? (parsed.data.status as UserStatus) : 'available';
    } catch (error) {
      console.error('Exception in getStatus:', error);
      return 'available';
    }
  }

  /**
   * Update your status
   */
  async setStatus(status: UserStatus): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('theia_user_status')
        .upsert(
          {
            user_phone: this.yourPhone,
            status,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_phone',
          }
        );

      if (error) {
        throw new Error(`Failed to update status: ${error.message}`);
      }
    } catch (error) {
      console.error('Error setting status:', error);
      throw error;
    }
  }

  /**
   * Parse relay commands from your messages
   */
  parseRelayCommand(text: string): RelayCommand | null {
    if (!text) return null;

    // Format: "@contact Send: message"
    const sendMatch = text.match(/^@([\w\+\-]+)\s+send:\s*(.+)$/is);
    if (sendMatch) {
      return {
        type: 'send',
        target: sendMatch[1].trim(),
        message: sendMatch[2].trim(),
      };
    }

    // Format: "Reply: message"
    const replyMatch = text.match(/^reply:\s*(.+)$/is);
    if (replyMatch) {
      return {
        type: 'reply',
        target: '',
        message: replyMatch[1].trim(),
      };
    }

    return null;
  }

  /**
   * Detect urgency in message text
   */
  detectUrgency(text: string): boolean {
    if (!text) return false;

    const lowerText = text.toLowerCase();

    // Check for urgent keywords
    if (URGENT_KEYWORDS.some((keyword) => lowerText.includes(keyword))) {
      return true;
    }

    // Check for multiple exclamation marks (3+)
    if ((text.match(/!/g) || []).length >= 3) {
      return true;
    }

    // Check for all caps (more than 50% and longer than 10 chars)
    const capsCount = (text.match(/[A-Z]/g) || []).length;
    const letterCount = (text.match(/[A-Za-z]/g) || []).length;
    if (letterCount > 10 && capsCount > letterCount * 0.5) {
      return true;
    }

    return false;
  }

  /**
   * Decide if should auto-respond to a message
   */
  async shouldAutoRespond(msg: AdvancedMessage): Promise<boolean> {
    try {
      const status = await this.getStatus();
      const isUrgent = this.detectUrgency(msg.text || '');

      // Always relay urgent messages
      if (isUrgent) return false;

      // Check contact preferences
      const { data: prefs } = await this.supabase
        .from('theia_contact_preferences')
        .select('allow_auto_respond')
        .eq('user_phone', this.yourPhone)
        .eq('contact_phone', msg.sender)
        .single();

      if (prefs && !prefs.allow_auto_respond) return false;

      // Status-based logic
      switch (status) {
        case 'available':
          return false;
        case 'busy':
          return !isUrgent;
        case 'away':
        case 'sleep':
        case 'dnd':
          return true;
        default:
          return false;
      }
    } catch (error) {
      console.error('Error in shouldAutoRespond:', error);
      return false;
    }
  }

  /**
   * Generate auto-response using modern AI SDK v4
   */
  async generateAutoResponse(msg: AdvancedMessage): Promise<string> {
    try {
      const status = await this.getStatus();

      // Get your communication style profile
      const { data: profile } = await this.supabase
        .from('theia_user_profile')
        .select('*')
        .eq('user_phone', this.yourPhone)
        .single();

      const styleContext = profile
        ? `Communication style: ${profile.typical_tone}. Common phrases: ${
            profile.common_phrases?.join(', ') || 'none'
          }. Emoji usage: ${profile.emoji_usage}.`
        : 'Communication style: friendly and professional.';

      const statusMessage =
        status !== 'available'
          ? STATUS_MESSAGES[status as keyof typeof STATUS_MESSAGES]
          : "I'm currently unavailable";

      const systemPrompt = `You are Theia, an AI assistant responding on behalf of a user who is ${status}.

${styleContext}

Your task: Respond naturally and briefly (1-2 sentences) to acknowledge the message.
Let them know the user will get back to them soon.
Be warm and helpful.
Always sign your response with "— Theia (AI Assistant)" at the end.

Context: ${statusMessage}.`;

      // Use modern AI SDK v4 with generateText
      const { text } = await generateText({
        model: getModel(),
        system: systemPrompt,
        prompt: msg.text || '',
        temperature: 0.7,
        maxTokens: 150,
      });

      // Ensure signature is present
      if (!text.includes('Theia')) {
        return `${text}\n\n— Theia (AI Assistant)`;
      }

      return text.trim();
    } catch (error) {
      console.error('Error generating auto-response:', error);
      // Fallback response
      return `Thanks for your message! The person you're trying to reach is currently unavailable. They'll get back to you soon.\n\n— Theia (AI Assistant)`;
    }
  }

  /**
   * Log relay activity to database
   */
  async logRelay(relay: Omit<RelayMessageType, 'id' | 'created_at'>): Promise<void> {
    try {
      const validated = RelayMessageSchema.parse({
        ...relay,
        conversation_id: relay.conversation_id || crypto.randomUUID(),
      });

      const { error } = await this.supabase.from('theia_relay_messages').insert(validated);

      if (error) {
        console.error('Error logging relay:', error);
      }
    } catch (error) {
      console.error('Error in logRelay:', error);
    }
  }

  /**
   * Get last sender for reply threading
   */
  async getLastSender(): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('theia_relay_messages')
        .select('from_user')
        .eq('to_user', this.yourPhone)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return null;

      return data.from_user;
    } catch (error) {
      console.error('Error getting last sender:', error);
      return null;
    }
  }

  /**
   * Get digest of recent messages
   */
  async getDigest(hoursBack: number = 2): Promise<string> {
    try {
      const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

      const { data: relays, error } = await this.supabase
        .from('theia_relay_messages')
        .select('*')
        .gte('created_at', since)
        .order('created_at', { ascending: false });

      if (error || !relays || relays.length === 0) {
        return `📊 Message Digest (last ${hoursBack} hours):\nNo messages during this period.`;
      }

      // Group by sender
      const bySender = relays.reduce((acc, relay) => {
        const sender = relay.from_user === this.yourPhone ? relay.to_user : relay.from_user;
        if (!acc[sender]) {
          acc[sender] = {
            count: 0,
            urgent: 0,
            autoResponded: 0,
          };
        }
        acc[sender].count++;
        if (relay.is_urgent) acc[sender].urgent++;
        if (relay.was_auto_responded) acc[sender].autoResponded++;
        return acc;
      }, {} as Record<string, { count: number; urgent: number; autoResponded: number }>);

      let digest = `📊 Message Digest (last ${hoursBack} hours):\n`;
      digest += `Total: ${relays.length} messages\n\n`;

      for (const [sender, stats] of Object.entries(bySender)) {
        digest += `• ${sender}: ${stats.count} message${stats.count > 1 ? 's' : ''}`;
        if (stats.urgent > 0) digest += ` (${stats.urgent} urgent)`;
        if (stats.autoResponded > 0) digest += ` (${stats.autoResponded} auto-responded)`;
        digest += '\n';
      }

      return digest.trim();
    } catch (error) {
      console.error('Error generating digest:', error);
      return `❌ Error generating digest: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  /**
   * Initialize user in database if not exists
   */
  async initializeUser(): Promise<void> {
    try {
      // Initialize status
      await this.supabase.from('theia_user_status').upsert(
        {
          user_phone: this.yourPhone,
          status: 'available',
          auto_respond_enabled: true,
        },
        {
          onConflict: 'user_phone',
          ignoreDuplicates: true,
        }
      );

      // Initialize profile
      await this.supabase.from('theia_user_profile').upsert(
        {
          user_phone: this.yourPhone,
          typical_tone: 'friendly',
          common_phrases: ['sounds good', 'let me check', 'thanks'],
          emoji_usage: 'moderate',
          avg_response_length: 100,
          timezone: 'UTC',
          work_hours: { start: '09:00', end: '17:00' },
        },
        {
          onConflict: 'user_phone',
          ignoreDuplicates: true,
        }
      );
    } catch (error) {
      console.error('Error initializing user:', error);
    }
  }
}

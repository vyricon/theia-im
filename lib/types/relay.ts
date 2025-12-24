// Re-export all types from advanced-imessage-kit
export * from './index';

// Additional relay-specific types
import { z } from 'zod';
import type { Message } from './message';

// User Status Types
export const UserStatusEnum = z.enum(['available', 'busy', 'away', 'sleep', 'dnd']);
export type UserStatus = z.infer<typeof UserStatusEnum>;

// Relay Message Types
export const RelayMethodEnum = z.enum(['manual', 'auto', 'urgent']);
export type RelayMethod = z.infer<typeof RelayMethodEnum>;

export const RelayMessageSchema = z.object({
  id: z.string().uuid().optional(),
  conversation_id: z.string().uuid(),
  from_user: z.string(),
  to_user: z.string(),
  original_text: z.string(),
  relayed_text: z.string().optional(),
  relay_method: RelayMethodEnum,
  was_auto_responded: z.boolean(),
  is_urgent: z.boolean(),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.string().optional(),
});
export type RelayMessageType = z.infer<typeof RelayMessageSchema>;

// Relay Command Types
export const RelayCommandTypeEnum = z.enum(['send', 'reply', 'broadcast']);
export type RelayCommandType = z.infer<typeof RelayCommandTypeEnum>;

export const RelayCommandSchema = z.object({
  type: RelayCommandTypeEnum,
  target: z.string(),
  message: z.string(),
});
export type RelayCommand = z.infer<typeof RelayCommandSchema>;

// Use Message type from advanced-imessage-kit
export type { Message };

// Constants
export const URGENT_KEYWORDS = [
  'emergency',
  'urgent',
  'asap',
  'now',
  'immediately',
  'help',
  '911',
  'critical',
  'important',
  'hospital',
  'police',
] as const;

export const STATUS_MESSAGES: Record<Exclude<UserStatus, 'available'>, string> = {
  away: "I'm currently away",
  busy: "I'm busy at the moment",
  sleep: "I'm sleeping right now",
  dnd: "I'm unavailable",
};

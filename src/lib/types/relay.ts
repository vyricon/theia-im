/**
 * Relay-specific types for Theia Smart Relay Mode
 */
import { z } from 'zod';

// User Status Types
export const UserStatusEnum = z.enum(['available', 'busy', 'away', 'sleep', 'dnd']);
export type UserStatus = z.infer<typeof UserStatusEnum>;

export const UserStatusSchema = z.object({
  id: z.string().uuid().optional(),
  user_phone: z.string(),
  status: UserStatusEnum,
  auto_respond_enabled: z.boolean().optional(),
  updated_at: z.string().optional(),
});
export type UserStatusType = z.infer<typeof UserStatusSchema>;

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

// Status Messages
export const STATUS_MESSAGES: Record<UserStatus, string> = {
  available: "I'm available now!",
  busy: "I'm busy at the moment but will respond when I can.",
  away: "I'm away from my phone right now.",
  sleep: "I'm sleeping right now, will respond in the morning.",
  dnd: "I'm in Do Not Disturb mode. For urgent matters, please call.",
};

// Urgent Keywords
export const URGENT_KEYWORDS = [
  'urgent',
  'emergency',
  'asap',
  'immediately',
  'help',
  'critical',
  'important',
];

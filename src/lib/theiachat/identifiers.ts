import { z } from 'zod';
import { parsePhoneNumberFromString } from 'libphonenumber-js/min';

export const IdentifierKindSchema = z.enum(['email', 'phone']);
export type IdentifierKind = z.infer<typeof IdentifierKindSchema>;

export const PhoneModeSchema = z.enum(['plus_only']);
export type PhoneMode = z.infer<typeof PhoneModeSchema>;

export type NormalizedIdentifier = {
  kind: IdentifierKind;
  value_raw: string;
  value_norm: string;
  label?: string | null;
  is_primary?: boolean;
};

const EmailSchema = z
  .string()
  .trim()
  .min(1)
  .email()
  .transform((v) => v.trim());

const PhoneRawSchema = z.string().trim().min(1);

export function normalizeEmail(raw: string): {
  value_raw: string;
  value_norm: string;
} {
  const value_raw = EmailSchema.parse(raw);
  const value_norm = value_raw.toLowerCase();
  return { value_raw, value_norm };
}

/**
 * Strict phone normalization.
 *
 * phone_mode: 'plus_only' requires raw phone number to be parseable AND to include a leading '+'.
 * Returns value_norm in E.164.
 */
export function normalizePhone(
  raw: string,
  opts: { phone_mode: 'plus_only' } = { phone_mode: 'plus_only' },
): { value_raw: string; value_norm: string } {
  const value_raw = PhoneRawSchema.parse(raw);

  if (opts.phone_mode === 'plus_only' && !value_raw.startsWith('+')) {
    throw new Error('Phone number must be in E.164 format and start with +');
  }

  const phone = parsePhoneNumberFromString(value_raw);
  if (!phone || !phone.isValid()) {
    throw new Error('Invalid phone number');
  }

  const value_norm = phone.number; // E.164
  if (opts.phone_mode === 'plus_only' && !value_norm.startsWith('+')) {
    throw new Error('Phone number must normalize to E.164 with +');
  }

  return { value_raw, value_norm };
}

export const ContactIdentifierInputSchema = z
  .object({
    kind: IdentifierKindSchema,
    value: z.string(),
    label: z.string().trim().min(1).max(128).optional(),
    is_primary: z.boolean().optional(),
    phone_mode: PhoneModeSchema.optional().default('plus_only'),
  })
  .strict();

export type ContactIdentifierInput = z.infer<
  typeof ContactIdentifierInputSchema
>;

export function normalizeIdentifier(
  input: ContactIdentifierInput,
): NormalizedIdentifier {
  const parsed = ContactIdentifierInputSchema.parse(input);
  if (parsed.kind === 'email') {
    const { value_raw, value_norm } = normalizeEmail(parsed.value);
    return {
      kind: 'email',
      value_raw,
      value_norm,
      label: parsed.label ?? null,
      is_primary: parsed.is_primary,
    };
  }

  const { value_raw, value_norm } = normalizePhone(parsed.value, {
    phone_mode: parsed.phone_mode,
  });

  return {
    kind: 'phone',
    value_raw,
    value_norm,
    label: parsed.label ?? null,
    is_primary: parsed.is_primary,
  };
}

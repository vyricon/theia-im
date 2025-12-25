import { z } from "zod";
import { parsePhoneNumberFromString } from "libphonenumber-js";

export type IdentifierKind = "email" | "phone";

export const TheiaChatIdentifierInputSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("email"),
    value: z.string().trim().email(),
  }),
  z.object({
    kind: z.literal("phone"),
    value: z.string().trim().min(2),
  }),
]);

export type TheiaChatIdentifierInput = z.infer<typeof TheiaChatIdentifierInputSchema>;

export function normalizeIdentifier(input: TheiaChatIdentifierInput): {
  kind: IdentifierKind;
  valueRaw: string;
  valueNorm: string;
} {
  const parsed = TheiaChatIdentifierInputSchema.parse(input);

  if (parsed.kind === "email") {
    const raw = parsed.value;
    return { kind: "email", valueRaw: raw, valueNorm: raw.trim().toLowerCase() };
  }

  // phone_mode: plus_only
  const raw = parsed.value;
  if (!raw.startsWith("+")) {
    throw new Error("Phone must be in E.164 format and start with '+'.");
  }

  const pn = parsePhoneNumberFromString(raw);
  if (!pn || !pn.isValid()) {
    throw new Error("Invalid phone number (must be valid E.164).");
  }

  return { kind: "phone", valueRaw: raw, valueNorm: pn.number }; // normalized E.164
}

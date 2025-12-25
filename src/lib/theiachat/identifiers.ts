export type IdentifierType =
  | "email"
  | "phone"
  | "supabase_user_id"
  | "external";

export type ContactIdentifier = {
  type: IdentifierType;
  value: string;
};

export function normalizeIdentifier(i: ContactIdentifier): ContactIdentifier {
  if (i.type === "email") return { ...i, value: i.value.trim().toLowerCase() };
  if (i.type === "phone") return { ...i, value: i.value.replace(/\s+/g, "") };
  return { ...i, value: i.value.trim() };
}

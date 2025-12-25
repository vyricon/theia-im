import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { theiachatContacts } from "@/lib/db/schema/theiachat_contacts";
import { theiachatContactIdentifiers } from "@/lib/db/schema/theiachat_contact_identifiers";
import { normalizeIdentifier, type TheiaChatIdentifierInput } from "./identifiers";

export async function resolveContactId(params: {
  workspaceId: string;
  identifier: TheiaChatIdentifierInput;
  displayName?: string | null;
}): Promise<string> {
  const { workspaceId, displayName } = params;
  const id = normalizeIdentifier(params.identifier);

  const existing = await db
    .select({ contactId: theiachatContactIdentifiers.contactId })
    .from(theiachatContactIdentifiers)
    .where(
      and(
        eq(theiachatContactIdentifiers.workspaceId, workspaceId),
        eq(theiachatContactIdentifiers.kind, id.kind),
        eq(theiachatContactIdentifiers.valueNorm, id.valueNorm),
      ),
    )
    .limit(1);

  if (existing[0]?.contactId) return existing[0].contactId;

  const inserted = await db
    .insert(theiachatContacts)
    .values({
      workspaceId,
      displayName: displayName ?? null,
    })
    .returning({ id: theiachatContacts.id });

  const contactId = inserted[0]!.id;

  await db.insert(theiachatContactIdentifiers).values({
    workspaceId,
    contactId,
    kind: id.kind,
    valueRaw: id.valueRaw,
    valueNorm: id.valueNorm,
    isPrimary: true,
  });

  return contactId;
}

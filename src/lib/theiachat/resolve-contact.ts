import { and, eq } from "drizzle-orm";
import { db } from "../db";
import {
  theiachatContacts,
  theiachatContactIdentifiers,
} from "../db/schema";
import {
  type ContactIdentifier,
  normalizeIdentifier,
} from "./identifiers";

export async function resolveContactId(params: {
  workspaceId: string;
  identifier: ContactIdentifier;
  displayName?: string | null;
}): Promise<string> {
  const { workspaceId, displayName } = params;
  const identifier = normalizeIdentifier(params.identifier);

  const existing = await db
    .select({ contactId: theiachatContactIdentifiers.contactId })
    .from(theiachatContactIdentifiers)
    .where(
      and(
        eq(theiachatContactIdentifiers.workspaceId, workspaceId),
        eq(theiachatContactIdentifiers.type, identifier.type),
        eq(theiachatContactIdentifiers.value, identifier.value)
      )
    )
    .limit(1);

  if (existing[0]?.contactId) return existing[0].contactId;

  const insertedContacts = await db
    .insert(theiachatContacts)
    .values({
      workspaceId,
      displayName: displayName ?? null,
    })
    .returning({ id: theiachatContacts.id });

  const contactId = insertedContacts[0]!.id;

  await db.insert(theiachatContactIdentifiers).values({
    workspaceId,
    contactId,
    type: identifier.type,
    value: identifier.value,
  });

  return contactId;
}

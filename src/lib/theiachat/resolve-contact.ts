import { and, eq } from 'drizzle-orm';
import {
  theiachatContacts,
  theiachatContactIdentifiers,
} from '../db/schema';
import { normalizeIdentifier } from './identifiers';
import type { Db } from '../db';

/**
 * Resolve a contact within a workspace by identifier (email/phone).
 *
 * This relies on theiachat_contact_identifiers.value_norm being normalized:
 *  - email: lowercase
 *  - phone: E.164, plus-only
 */
export async function resolveContactByIdentifier(db: Db, args: {
  workspace_id: string;
  identifier: {
    kind: 'email' | 'phone';
    value: string;
    phone_mode?: 'plus_only';
  };
}): Promise<{ contact_id: string } | null> {
  const norm = normalizeIdentifier({
    kind: args.identifier.kind,
    value: args.identifier.value,
    phone_mode: args.identifier.phone_mode ?? 'plus_only',
  });

  const rows = await db
    .select({ contact_id: theiachatContacts.id })
    .from(theiachatContactIdentifiers)
    .innerJoin(
      theiachatContacts,
      eq(theiachatContacts.id, theiachatContactIdentifiers.contact_id),
    )
    .where(
      and(
        eq(theiachatContactIdentifiers.workspace_id, args.workspace_id),
        eq(theiachatContactIdentifiers.kind, norm.kind),
        eq(theiachatContactIdentifiers.value_norm, norm.value_norm),
      ),
    )
    .limit(1);

  if (rows.length === 0) return null;
  return { contact_id: rows[0].contact_id };
}

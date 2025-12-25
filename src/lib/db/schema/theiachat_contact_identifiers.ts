import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  uuid,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

import { theiachatWorkspaces } from './theiachat_workspaces';
import { theiachatContacts } from './theiachat_contacts';

/**
 * Contact identifiers (email / phone) attached to a contact within a workspace.
 *
 * value_raw: user-provided value (trimmed)
 * value_norm:
 *  - email: lowercased, trimmed
 *  - phone: E.164 in plus-only mode (e.g. +14155552671)
 */
export const theiachatContactIdentifiers = pgTable(
  'theiachat_contact_identifiers',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    workspace_id: uuid('workspace_id')
      .notNull()
      .references(() => theiachatWorkspaces.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),

    contact_id: uuid('contact_id')
      .notNull()
      .references(() => theiachatContacts.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),

    /** email | phone */
    kind: varchar('kind', { length: 16 }).notNull(),

    value_raw: text('value_raw').notNull(),
    value_norm: text('value_norm').notNull(),

    /** Optional label shown in UI (e.g. "work", "home") */
    label: varchar('label', { length: 128 }),

    is_primary: boolean('is_primary').notNull().default(false),

    /** When identifier was verified (if ever) */
    verified_at: timestamp('verified_at', { withTimezone: true }),

    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),

    updated_at: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    // Prevent duplicates for the same contact in the same workspace.
    // (Workspace included to keep index locality and allow same identifier value in different workspaces.)
    uniq_contact_kind_norm: uniqueIndex(
      'theiachat_contact_identifiers__uniq_contact_kind_norm',
    ).on(t.workspace_id, t.contact_id, t.kind, t.value_norm),

    // Fast lookup by identifier within a workspace (resolve contact by email/phone)
    idx_workspace_kind_norm: index(
      'theiachat_contact_identifiers__idx_workspace_kind_norm',
    ).on(t.workspace_id, t.kind, t.value_norm),

    // Convenience: query all identifiers for a contact
    idx_workspace_contact: index(
      'theiachat_contact_identifiers__idx_workspace_contact',
    ).on(t.workspace_id, t.contact_id),

    // Ensure only one primary identifier per kind per contact
    uniq_primary_per_kind: uniqueIndex(
      'theiachat_contact_identifiers__uniq_primary_per_kind',
    )
      .on(t.workspace_id, t.contact_id, t.kind)
      .where(t.is_primary),
  }),
);

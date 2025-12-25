import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { theiachatContacts } from "./theiachat_contacts";
import { theiachatWorkspaces } from "./theiachat_workspaces";

export const theiachatIdentifierKind = pgEnum("theiachat_identifier_kind", [
  "email",
  "phone",
]);

export const theiachatContactIdentifiers = pgTable(
  "theiachat_contact_identifiers",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => theiachatWorkspaces.id, { onDelete: "cascade" }),

    contactId: uuid("contact_id")
      .notNull()
      .references(() => theiachatContacts.id, { onDelete: "cascade" }),

    kind: theiachatIdentifierKind("kind").notNull(),

    valueRaw: text("value_raw").notNull(),
    valueNorm: text("value_norm").notNull(),

    label: text("label"),
    isPrimary: boolean("is_primary").notNull().default(false),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    wsKindValueUnique: uniqueIndex("theiachat_ident_ws_kind_value_unique").on(
      t.workspaceId,
      t.kind,
      t.valueNorm,
    ),
    lookupIdx: index("theiachat_ident_lookup_idx").on(t.workspaceId, t.kind, t.valueNorm),
    contactIdx: index("theiachat_ident_contact_idx").on(t.contactId),
  }),
);

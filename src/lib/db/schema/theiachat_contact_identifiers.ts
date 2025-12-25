import { pgEnum, pgTable, text, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core";

export const theiachatIdentifierType = pgEnum("theiachat_identifier_type", [
  "email",
  "phone",
  "supabase_user_id",
  "external",
]);

export const theiachatContactIdentifiers = pgTable(
  "theiachat_contact_identifiers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id").notNull(),
    contactId: uuid("contact_id").notNull(),
    type: theiachatIdentifierType("type").notNull(),
    value: text("value").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    workspaceTypeValueUnique: uniqueIndex(
      "theiachat_contact_identifiers_workspace_type_value_unique"
    ).on(t.workspaceId, t.type, t.value),
  })
);

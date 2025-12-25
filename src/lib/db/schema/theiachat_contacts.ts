import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { theiachatWorkspaces } from "./theiachat_workspaces";

export const theiachatContacts = pgTable(
  "theiachat_contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => theiachatWorkspaces.id, { onDelete: "cascade" }),

    displayName: text("display_name"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    workspaceIdx: index("theiachat_contacts_workspace_idx").on(t.workspaceId),
  }),
);

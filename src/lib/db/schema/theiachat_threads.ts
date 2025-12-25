import { pgTable, text, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core";

export const theiachatThreads = pgTable(
  "theiachat_threads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id").notNull(),
    externalThreadId: text("external_thread_id"),
    subject: text("subject"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    threadExternalUnique: uniqueIndex(
      "theiachat_threads_workspace_external_thread_id_unique"
    ).on(t.workspaceId, t.externalThreadId),
  })
);

import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";

export const theiachatMessages = pgTable(
  "theiachat_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id").notNull(),
    threadId: uuid("thread_id").notNull(),
    senderContactId: uuid("sender_contact_id"),
    externalMessageId: text("external_message_id"),
    role: text("role").notNull().default("user"),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    threadIdx: index("theiachat_messages_thread_idx").on(t.threadId),
    externalIdx: index("theiachat_messages_external_message_idx").on(
      t.workspaceId,
      t.externalMessageId
    ),
  })
);

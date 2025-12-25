import postgres from "postgres";
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { z } from "zod";
import * as schema from "./schema";

/**
 * Database environment validation with Zod
 */
const DbEnvSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL URL"),
});

function validateDbEnv() {
  const result = DbEnvSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
  });

  if (!result.success) {
    throw new Error(
      `Invalid database environment:\n${result.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n")}`
    );
  }

  return result.data;
}

const env = validateDbEnv();
const databaseUrl = env.DATABASE_URL;

// Reuse a single connection in dev to avoid exhausting connections with hot reloads.
// (Safe in Node runtimes; not intended for edge runtimes.)
const globalForDb = globalThis as unknown as {
  __theia_sql?: postgres.Sql;
};

export const sql =
  globalForDb.__theia_sql ??
  postgres(databaseUrl, {
    // Prefer SSL settings be encoded in DATABASE_URL; show a sane default for hosted PG.
    ssl: process.env.DATABASE_SSL === "false" ? false : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__theia_sql = sql;
}

export const db = drizzle(sql, { schema });

export type Db = PostgresJsDatabase<typeof schema>;

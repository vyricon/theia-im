import postgres from "postgres";
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

const databaseUrl = requireEnv("DATABASE_URL");

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

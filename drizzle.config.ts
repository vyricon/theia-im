import { defineConfig } from "drizzle-kit";
import { z } from "zod";
import { formatZodError } from "./src/lib/utils/validation";

/**
 * Drizzle config environment validation
 */
const DrizzleEnvSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL URL"),
});

function validateEnv() {
  const result = DrizzleEnvSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
  });

  if (!result.success) {
    throw new Error(formatZodError(result.error, "Invalid Drizzle environment"));
  }

  return result.data;
}

const env = validateEnv();

export default defineConfig({
  schema: "./src/lib/db/schema/index.ts",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
});

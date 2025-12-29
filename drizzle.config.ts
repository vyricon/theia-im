import { defineConfig } from "drizzle-kit";
import { formatZodError, DatabaseUrlSchema } from "./src/lib/utils/validation";

/**
 * Drizzle config environment validation
 */
function validateEnv() {
  const result = DatabaseUrlSchema.safeParse({
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

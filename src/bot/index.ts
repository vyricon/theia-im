#!/usr/bin/env node
/**
 * src/bot/index.ts
 * Production bot entrypoint with error handling and env validation
 */

import { z } from "zod";

/**
 * Bot environment validation schema
 */
const BotEnvSchema = z.object({
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
});

/**
 * Validate required environment variables
 */
function validateEnv() {
  const result = BotEnvSchema.safeParse({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
  });

  if (!result.success) {
    console.error("❌ Environment validation failed:");
    result.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    });
    process.exit(1);
  }

  return result.data;
}

/**
 * Main bot startup
 */
async function main() {
  console.log("🤖 Starting Theia Bot...");

  // Validate environment
  const env = validateEnv();
  console.log("✅ Environment validated");
  console.log(`   SUPABASE_URL: ${env.SUPABASE_URL}`);
  console.log(`   DATABASE_URL: ${env.DATABASE_URL}`);

  // Import the bot handler after env validation
  const { handleIncomingMessage } = await import(
    "../../scripts/theia-bot"
  );

  console.log("✅ Bot logic loaded");
  console.log("🚀 Bot is running. Press Ctrl+C to stop.");

  // In a real deployment, this would connect to message sources
  // For now, we're just validating the module loads and env is correct
  console.log(
    "ℹ️  Note: This is the bot entrypoint. Integration with message sources happens in scripts/theia-bot.ts"
  );

  // Keep process alive
  process.on("SIGINT", () => {
    console.log("\n👋 Shutting down Theia Bot...");
    process.exit(0);
  });

  // Prevent process from exiting
  await new Promise(() => {});
}

// Execute with error handling
main().catch((error) => {
  console.error("❌ Fatal error in bot:", error);
  process.exit(1);
});

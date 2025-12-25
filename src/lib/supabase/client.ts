/**
 * Server-only Supabase client module.
 * 
 * ⚠️ WARNING: This module contains server-only code with service role keys.
 * - In Next.js: Import only in Server Components, API routes, or server actions
 * - In Node.js scripts: Safe to import (e.g., bot entrypoint)
 * - NEVER import in Client Components or expose in browser bundles
 */

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

/**
 * Server-only Supabase client environment validation.
 */
const ServerSupabaseEnv = z.object({
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
});

function getServerSupabaseEnv() {
  const parsed = ServerSupabaseEnv.safeParse({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid Supabase server environment:\n${parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n")}`
    );
  }

  return parsed.data;
}

/**
 * Server-only Supabase client (service role).
 *
 * IMPORTANT:
 * - Do NOT import this module into client components.
 * - Uses SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 */
export function createSupabaseServerClient() {
  const env = getServerSupabaseEnv();

  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Browser/client-side Supabase client (anon key).
 *
 * Uses NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createClient(url, anonKey);
}

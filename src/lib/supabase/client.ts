import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const envSchema = z
  .object({
    // Prefer server-side SUPABASE_URL when available. NEXT_PUBLIC_SUPABASE_URL is for browser usage.
    SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    SUPABASE_ANON_KEY: z.string().min(1),
  })
  .superRefine((v, ctx) => {
    if (!v.SUPABASE_URL && !v.NEXT_PUBLIC_SUPABASE_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Missing SUPABASE_URL (server) or NEXT_PUBLIC_SUPABASE_URL (client)",
        path: ["SUPABASE_URL"],
      });
    }
  });

const env = envSchema.parse({
  SUPABASE_URL: process.env.SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
});

export const supabaseUrl = env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL!;
export const supabaseAnonKey = env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

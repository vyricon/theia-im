/**
 * Shared utilities for Zod validation error formatting
 */
import { z } from "zod";

/**
 * Format Zod validation error issues into a readable error message
 */
export function formatZodError(error: z.ZodError, context: string = "Validation"): string {
  return `${context}:\n${error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "root";
      return `  - ${path}: ${issue.message}`;
    })
    .join("\n")}`;
}

/**
 * Shared database URL validation schema
 */
export const DatabaseUrlSchema = z.object({
  DATABASE_URL: z
    .string()
    .regex(
      /^postgres(ql)?:\/\//,
      "DATABASE_URL must be a valid PostgreSQL connection string (starting with postgresql:// or postgres://)"
    ),
});

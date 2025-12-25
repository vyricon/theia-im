/**
 * Shared utilities for Zod validation error formatting
 */
import { z } from "zod";

/**
 * Format Zod validation error issues into a readable error message
 */
export function formatZodError(error: z.ZodError, context: string = "Validation"): string {
  return `${context}:\n${error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n")}`;
}

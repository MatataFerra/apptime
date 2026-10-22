import { z } from "zod";

import { isCurrency } from "@/utils/constants/currencies";

/** Optional text: trimmed, and empty means "not set" (null). */
function optional(max: number) {
  return z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => value || null);
}

/**
 * An employer as the user enters it. Owner and `archived` are set on the
 * server. Shared by the form (to show errors) and the server actions.
 */
export const EmployerInputSchema = z
  .object({
    name: z.string().trim().min(1, "Add a name").max(80),
    taxId: optional(40),
    address: optional(160),
    city: optional(80),
    postcode: optional(20),
    country: optional(80),
    industry: optional(80),
    contactName: optional(80),
    contactEmail: optional(120).refine(
      (value) => value === null || z.string().email().safeParse(value).success,
      "Check the email"
    ),
    contactPhone: optional(40),
    defaultRate: z
      .number()
      .finite()
      .min(0, "The rate can't be negative")
      .max(100_000)
      .nullish()
      .transform((value) => value ?? null),
    defaultCurrency: z
      .string()
      .nullish()
      .transform((value) => value || null)
      .refine((value) => value === null || isCurrency(value), "Pick a currency"),
    notes: optional(500),
  })
  .strict();

export type EmployerInput = z.input<typeof EmployerInputSchema>;
export type EmployerData = z.output<typeof EmployerInputSchema>;

/** First error per field, for the form. */
export function fieldErrors(error: z.ZodError) {
  const errors: Partial<Record<keyof EmployerData, string>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as keyof EmployerData | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

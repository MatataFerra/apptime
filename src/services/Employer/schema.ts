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
    name: z.string().trim().min(1, "employer_name_required").max(80),
    taxId: optional(40),
    address: optional(160),
    city: optional(80),
    region: optional(80),
    postcode: optional(20),
    country: optional(80),
    industry: optional(80),
    contactName: optional(80),
    contactEmail: optional(120).refine(
      (value) => value === null || z.string().email().safeParse(value).success,
      "employer_email_invalid"
    ),
    contactPhone: optional(40),
    defaultRate: z
      .number()
      .finite()
      .min(0, "employer_rate_negative")
      .max(100_000)
      .nullish()
      .transform((value) => value ?? null),
    defaultCurrency: z
      .string()
      .nullish()
      .transform((value) => value || null)
      .refine((value) => value === null || isCurrency(value), "employer_currency_invalid"),
    notes: optional(500),
    /**
     * Set by a register lookup, not typed: which register and when. Left out
     * on edit, the saved one stays; it can't be cleared from the form.
     */
    source: z
      .object({
        registry: z.enum(["abr", "nzbn", "vies"]),
        // A lookup made in this form: not in the future, not days old.
        at: z
          .string()
          .datetime()
          .refine((value) => {
            const age = Date.now() - new Date(value).getTime();
            return age > -5 * 60_000 && age < 24 * 60 * 60_000;
          }, "employer_search_again"),
      })
      .strict()
      .optional(),
  })
  .strict()
  .transform(({ source, ...employer }) => ({
    ...employer,
    ...(source && { sourceRegistry: source.registry, sourcedAt: new Date(source.at) }),
  }));

export type EmployerInput = z.input<typeof EmployerInputSchema>;
export type EmployerData = z.output<typeof EmployerInputSchema>;

/**
 * First error per field, for the form. Messages written above are keys under
 * "errors" in messages/*.json; the form translates them.
 */
export function fieldErrors(error: z.ZodError) {
  const errors: Partial<Record<keyof EmployerInput, string>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as keyof EmployerInput | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

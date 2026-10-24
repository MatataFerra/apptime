import type { SalaryItemInput } from "@/types";

type Rated = Pick<SalaryItemInput, "value">;

/**
 * Contributions add a share of the base pay (holiday pay, casual
 * loading…). They're summed, not compounded: 8% + 25% is 33% of the base.
 */
export function contributionRate(contributions?: Rated[] | null) {
  const total = (contributions ?? []).reduce((acc, c) => acc + (Number(c.value) || 0), 0);
  return Math.round(total * 100) / 100;
}

/** Base pay plus its contributions. Taxes come off this total. */
export function withContributions(base: number, contributions?: Rated[] | null) {
  const rate = contributionRate(contributions);
  if (!rate) return base;
  return Math.round(base * (1 + rate / 100) * 100) / 100;
}

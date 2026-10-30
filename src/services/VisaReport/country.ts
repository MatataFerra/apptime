import { canonicalCountry } from "@/services/Employer/country";

import type { VisaCountry } from "./programs";

/*
  An employer's country is the picker's English name, but older employers
  may have "NZ" or "Nueva Zelanda": canonicalCountry reads them all. Only
  the countries with a visa program are told apart; anything else is
  "another country".
*/

const PROGRAM_COUNTRIES: Record<string, VisaCountry> = {
  Australia: "AU",
  "New Zealand": "NZ",
};

/**
 * "Australia" -> "AU". `null` when the employer has no country, "other"
 * when it's set but isn't one with a program.
 */
export function visaCountryOf(country: string | null | undefined): VisaCountry | "other" | null {
  if (!country?.trim()) return null;
  const name = canonicalCountry(country);
  return (name && PROGRAM_COUNTRIES[name]) || "other";
}

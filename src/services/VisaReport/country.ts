import type { VisaCountry } from "./programs";

/*
  An employer's country is free text ("Australia", "NZ", "Nueva Zelanda",
  or what a register lookup filled in). Only the countries with a visa
  program are told apart; anything else is "another country".
*/

const NAMES: Record<VisaCountry, string[]> = {
  AU: ["au", "aus", "australia", "commonwealth of australia"],
  NZ: [
    "nz",
    "nzl",
    "new zealand",
    "nueva zelanda",
    "neuseeland",
    "aotearoa",
    "aotearoa new zealand",
  ],
};

function normalize(text: string) {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[.,]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * "Australia" -> "AU". `null` when the employer has no country, "other"
 * when it's set but isn't one with a program.
 */
export function visaCountryOf(country: string | null | undefined): VisaCountry | "other" | null {
  if (!country?.trim()) return null;
  const value = normalize(country);
  const match = (Object.keys(NAMES) as VisaCountry[]).find((code) => NAMES[code].includes(value));
  return match ?? "other";
}

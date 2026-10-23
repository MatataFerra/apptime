import { z } from "zod";

import { present, tidyName } from "../text";
import type { BusinessDetails, RegistryResult } from "../types";

/*
  VIES, the European Commission's VAT number check (no key needed). It only
  answers "is this number valid", plus name and address where the member
  state shares them; Germany and Spain, among others, send "---".
*/

/** VIES prefix -> country, as it goes in the form. Greece is EL, Northern Ireland XI. */
export const VIES_COUNTRIES: Record<string, string> = {
  AT: "Austria",
  BE: "Belgium",
  BG: "Bulgaria",
  CY: "Cyprus",
  CZ: "Czechia",
  DE: "Germany",
  DK: "Denmark",
  EE: "Estonia",
  EL: "Greece",
  ES: "Spain",
  FI: "Finland",
  FR: "France",
  HR: "Croatia",
  HU: "Hungary",
  IE: "Ireland",
  IT: "Italy",
  LT: "Lithuania",
  LU: "Luxembourg",
  LV: "Latvia",
  MT: "Malta",
  NL: "Netherlands",
  PL: "Poland",
  PT: "Portugal",
  RO: "Romania",
  SE: "Sweden",
  SI: "Slovenia",
  SK: "Slovakia",
  XI: "United Kingdom (Northern Ireland)",
};

/** "de 123 456 789" -> { country: "DE", number: "123456789" }; null if it can't be one. */
export function splitVat(value: string) {
  const clean = value.toUpperCase().replace(/[\s.\-/]/g, "");
  const m = clean.match(/^([A-Z]{2})([0-9A-Z+*]{2,12})$/);
  if (!m) return null;
  const country = m[1] === "GR" ? "EL" : m[1];
  if (!VIES_COUNTRIES[country]) return null;
  return { country, number: m[2] };
}

/** "Hauptstr. 5\n10115 Berlin" -> street, postcode, city. */
function splitAddress(address: string | null) {
  if (!address) return {};
  const lines = address
    .split(/\n|,(?=\s*\S)/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (lines.length === 0) return {};
  const last = lines[lines.length - 1];
  // Postcode first in most of the EU ("10115 Berlin", "1012 AB Amsterdam").
  const m = last.match(/^([A-Z]{0,2}-?\d[\dA-Z]{2,6}(?: [A-Z]{2})?)\s+(.+)$/);
  const street = lines.slice(0, m ? -1 : lines.length - 1).join(", ");
  return {
    address: street ? tidyName(street) : undefined,
    postcode: m?.[1],
    city: tidyName(m ? m[2] : last),
  };
}

const ResponseSchema = z
  .object({
    isValid: z.boolean().nullish(),
    valid: z.boolean().nullish(),
    userError: z.string().nullish(),
    name: z.string().nullish(),
    address: z.string().nullish(),
    countryCode: z.string().nullish(),
    vatNumber: z.string().nullish(),
  })
  .passthrough();

const BUSY =
  /MS_UNAVAILABLE|MS_MAX_CONCURRENT_REQ|SERVICE_UNAVAILABLE|TIMEOUT|GLOBAL_MAX_CONCURRENT_REQ/;

export function parseVies(
  raw: unknown,
  asked: { country: string; number: string }
): RegistryResult<BusinessDetails> {
  const parsed = ResponseSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Unexpected answer from VIES" };
  const r = parsed.data;
  const countryName = VIES_COUNTRIES[asked.country];

  if (r.userError && BUSY.test(r.userError)) {
    return {
      ok: false,
      error: `${countryName}'s VAT service isn't answering right now, try later`,
    };
  }
  if (!(r.isValid ?? r.valid)) {
    return { ok: false, error: "That VAT number isn't registered for EU trade" };
  }

  const name = present(r.name);
  // Kept with its line breaks: they separate street from postcode and city.
  const address = present(r.address) ? (r.address as string).trim() : null;
  const legalName = name ? tidyName(name) : null;
  const id = `${asked.country}${asked.number}`;

  return {
    ok: true,
    data: {
      registry: "vies",
      id,
      active: true,
      status: "Valid VAT number",
      statusSince: null,
      legalName,
      names: legalName ? [legalName] : [],
      fields: { taxId: id, country: countryName, ...splitAddress(address) },
      facts: [{ label: "Country", value: countryName }],
      note:
        name || address
          ? null
          : `${countryName} doesn't share the name or address through VIES, only that the number is valid.`,
    },
  };
}

import { COUNTRIES } from "@/utils/constants/countries";
import { type CurrencyCode } from "@/utils/constants/currencies";

/*
  An employer's country is saved as the English name of COUNTRIES
  ("New Zealand"), the same value the Settings picker saves. Text that comes
  from elsewhere (pasted details, a register, an employer saved before the
  picker) is matched to that name here.
*/

/** Languages whose country names are recognised, besides English. */
const LANGUAGES = ["es", "de", "fr", "it", "pt", "nl"];

/** Other names people use that Intl doesn't give. */
const ALIASES: Record<string, string> = {
  uk: "GB",
  "great britain": "GB",
  britain: "GB",
  england: "GB",
  scotland: "GB",
  wales: "GB",
  "northern ireland": "GB",
  "united kingdom (northern ireland)": "GB",
  usa: "US",
  "united states of america": "US",
  america: "US",
  aus: "AU",
  "commonwealth of australia": "AU",
  nzl: "NZ",
  aotearoa: "NZ",
  "aotearoa new zealand": "NZ",
  holland: "NL",
  "the netherlands": "NL",
  czechia: "CZ",
};

/** Lower case, no accents, dots or extra spaces: "Nueva  Zelanda." -> "nueva zelanda". */
function normalize(text: string) {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[.,]/g, "")
    .replace(/\s+/g, " ");
}

const BY_ID = new Map(COUNTRIES.map((country) => [country.id, country.name]));

/** Every known spelling -> English name. Built once, on first use. */
let names: Map<string, string> | null = null;

function knownNames() {
  if (names) return names;
  names = new Map<string, string>();
  const map = names;
  function add(key: string, name: string) {
    const k = normalize(key);
    if (k && !map.has(k)) map.set(k, name);
  }
  for (const country of COUNTRIES) {
    add(country.name, country.name);
    add(country.id, country.name);
  }
  for (const [alias, id] of Object.entries(ALIASES)) {
    const name = BY_ID.get(id);
    if (name) add(alias, name);
  }
  for (const language of LANGUAGES) {
    let display: Intl.DisplayNames;
    try {
      display = new Intl.DisplayNames([language], { type: "region" });
    } catch {
      continue;
    }
    for (const country of COUNTRIES) {
      const local = display.of(country.id);
      if (local) add(local, country.name);
    }
  }
  return names;
}

/**
 * Edits to turn `a` into `b`: insert, delete or change a letter, or swap two
 * next to each other ("Germnay"). Optimal string alignment distance.
 */
function distance(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

/**
 * The English name for a country written any known way: "NZ", "Aotearoa",
 * "Nueva Zelanda", "Neuseeland" -> "New Zealand". Null when it isn't one.
 */
export function canonicalCountry(text: string | null | undefined): string | null {
  if (!text?.trim()) return null;
  return knownNames().get(normalize(text)) ?? null;
}

/**
 * The country a misspelling most likely means: "New Zeland" -> "New Zealand".
 * Only a close and unambiguous match (1 edit for short names, 2 for longer
 * ones), so it's offered as a suggestion, never applied on its own.
 */
export function suggestCountry(text: string | null | undefined): string | null {
  if (!text?.trim()) return null;
  const exact = canonicalCountry(text);
  if (exact) return exact;
  const value = normalize(text);
  if (value.length < 4) return null;
  const limit = value.length >= 8 ? 2 : 1;

  let best: { name: string; d: number } | null = null;
  let tie = false;
  for (const [key, name] of knownNames()) {
    if (key.length < 4 || Math.abs(key.length - value.length) > limit) continue;
    const d = distance(value, key);
    if (d > limit) continue;
    if (!best || d < best.d) {
      best = { name, d };
      tie = false;
    } else if (d === best.d && name !== best.name) {
      tie = true;
    }
  }
  return best && !tie ? best.name : null;
}

/**
 * Currencies that, for this app's users, mean one country: picking it says where the employer
 * is. EUR and USD are used in many, so they say nothing.
 */
const COUNTRY_OF_CURRENCY: Partial<Record<CurrencyCode, string>> = {
  AUD: "Australia",
  NZD: "New Zealand",
  GBP: "United Kingdom",
};

/** "NZD" -> "New Zealand"; null for a currency shared by several countries. */
export function countryForCurrency(currency: string | null | undefined): string | null {
  return COUNTRY_OF_CURRENCY[currency as CurrencyCode] ?? null;
}

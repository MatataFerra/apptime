/*
  Small text helpers shared by the registers.
*/

// Acronyms and company forms, written the way they're usually written.
const FIXED: Record<string, string> = Object.fromEntries(
  [
    // Australia
    "ABN",
    "ACN",
    "NSW",
    "VIC",
    "QLD",
    "SA",
    "WA",
    "TAS",
    "NT",
    "ACT",
    // Company forms
    "SARL",
    "SAS",
    "SASU",
    "EURL",
    "SNC",
    "SRL",
    "SL",
    "SLU",
    "SPA",
    "SAPA",
    "BV",
    "NV",
    "VOF",
    "AG",
    "KG",
    "OHG",
    "GBR",
    "UG",
    "LLC",
    "LLP",
    "PLC",
    "NZ",
    "UK",
    "EU",
  ]
    .map((w) => [w.toLowerCase(), w] as [string, string])
    .concat([
      ["gmbh", "GmbH"],
      ["ug", "UG"],
      ["co", "Co"],
    ])
);

// Connectors stay lower case unless they start the name.
const SMALL = new Set([
  "and",
  "of",
  "the",
  "for",
  "in",
  "on",
  "at", // English
  "de",
  "del",
  "la",
  "las",
  "los",
  "y",
  "e", // Spanish
  "du",
  "des",
  "le",
  "les",
  "et",
  "aux",
  "sur", // French
  "der",
  "die",
  "das",
  "und",
  "von",
  "zu",
  "am",
  "im", // German
  "van",
  "het",
  "en", // Dutch
  "di",
  "della",
  "dei", // Italian
]);

/**
 * "SUNNY FARMS PTY LTD" -> "Sunny Farms Pty Ltd", "VIGNOBLES DU SUD SARL"
 * -> "Vignobles du Sud SARL". Registers store most names in capitals;
 * mixed-case names are left as they are.
 */
export function tidyName(name: string) {
  const trimmed = name.trim();
  if (trimmed !== trimmed.toUpperCase()) return trimmed;
  let index = 0;
  return trimmed.toLowerCase().replace(/[\p{L}\p{N}']+/gu, (word) => {
    const first = index++ === 0;
    if (FIXED[word]) return FIXED[word];
    if (!first && SMALL.has(word)) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
}

/** Collapses spaces and trims; null for empty or the "---" registers use for "not shared". */
export function present(value: string | null | undefined) {
  const v = value?.replace(/\s+/g, " ").trim();
  return v && !/^-+$/.test(v) ? v : null;
}

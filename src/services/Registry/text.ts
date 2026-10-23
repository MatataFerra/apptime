/*
  Small text helpers shared by the registers.
*/

const KEEP_UPPER = new Set(["ABN", "ACN", "NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"]);
const SMALL = new Set(["and", "of", "the", "for", "in", "on", "at"]);

/**
 * "SUNNY FARMS PTY LTD" -> "Sunny Farms Pty Ltd". The register stores most
 * names in capitals; mixed-case names are left as they are.
 */
export function tidyName(name: string) {
  const trimmed = name.trim();
  if (trimmed !== trimmed.toUpperCase()) return trimmed;
  let index = 0;
  return trimmed.toLowerCase().replace(/[\p{L}\p{N}']+/gu, (word) => {
    const first = index++ === 0;
    if (KEEP_UPPER.has(word.toUpperCase())) return word.toUpperCase();
    if (!first && SMALL.has(word)) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
}

/** Collapses spaces and trims; null for empty or the "---" registers use for "not shared". */
export function present(value: string | null | undefined) {
  const v = value?.replace(/\s+/g, " ").trim();
  return v && !/^-+$/.test(v) ? v : null;
}

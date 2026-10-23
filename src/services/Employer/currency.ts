import { type CurrencyCode, isCurrency } from "@/utils/constants/currencies";

/*
  An employer's country -> the currency it pays in, for the ones the app
  supports. Used when a lookup or pasted text fills the country.
*/

// Euro area as of 2026 (Bulgaria joined on 1 January 2026), in English and local spelling.
const EURO = [
  "austria",
  "österreich",
  "belgium",
  "belgië",
  "belgique",
  "bulgaria",
  "croatia",
  "hrvatska",
  "cyprus",
  "estonia",
  "finland",
  "suomi",
  "france",
  "germany",
  "deutschland",
  "greece",
  "ireland",
  "italy",
  "italia",
  "latvia",
  "lithuania",
  "luxembourg",
  "malta",
  "netherlands",
  "nederland",
  "the netherlands",
  "portugal",
  "slovakia",
  "slovensko",
  "slovenia",
  "slovenija",
  "spain",
  "españa",
];

const BY_COUNTRY: Record<string, string> = {
  ...Object.fromEntries(EURO.map((c) => [c, "EUR"])),
  australia: "AUD",
  "new zealand": "NZD",
  aotearoa: "NZD",
  "united kingdom": "GBP",
  "united kingdom (northern ireland)": "GBP",
  uk: "GBP",
  england: "GBP",
  scotland: "GBP",
  wales: "GBP",
  "united states": "USD",
  usa: "USD",
  // Not in the app yet: returning them is harmless, isCurrency filters them out.
  czechia: "CZK",
  denmark: "DKK",
  hungary: "HUF",
  poland: "PLN",
  romania: "RON",
  sweden: "SEK",
  canada: "CAD",
  argentina: "ARS",
};

/** "New Zealand" -> "NZD"; null when unknown or not a currency the app has. */
export function currencyForCountry(country?: string | null): CurrencyCode | null {
  const code = BY_COUNTRY[country?.trim().toLowerCase() ?? ""];
  return isCurrency(code) ? code : null;
}

/**
 * Currencies offered in Settings and on each shift (ISO 4217). Totals
 * convert between them with daily exchange rates. Shifts saved earlier in
 * another currency keep it and are converted too.
 */
export const CURRENCIES = [
  { code: "EUR", label: "Euro" },
  { code: "USD", label: "US dollar" },
  { code: "AUD", label: "Australian dollar" },
  { code: "NZD", label: "New Zealand dollar" },
  { code: "GBP", label: "British pound" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];
export const DEFAULT_CURRENCY: CurrencyCode = "USD";

export function isCurrency(value: unknown): value is CurrencyCode {
  return CURRENCIES.some((c) => c.code === value);
}

/** "$", "€", "NZ$"… as shown in front of an amount field. */
export function currencySymbol(code: string) {
  try {
    return (
      new Intl.NumberFormat("en-US", { style: "currency", currency: code })
        .formatToParts(0)
        .find((p) => p.type === "currency")?.value ?? code
    );
  } catch {
    return code;
  }
}

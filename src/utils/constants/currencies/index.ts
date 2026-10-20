/** Currencies offered in Settings and on each shift. ISO 4217 codes. */
export const CURRENCIES = [
  { code: "USD", label: "US dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British pound" },
  { code: "AUD", label: "Australian dollar" },
  { code: "NZD", label: "New Zealand dollar" },
  { code: "CAD", label: "Canadian dollar" },
  { code: "CHF", label: "Swiss franc" },
  { code: "JPY", label: "Japanese yen" },
  { code: "ARS", label: "Argentine peso" },
  { code: "BRL", label: "Brazilian real" },
  { code: "CLP", label: "Chilean peso" },
  { code: "MXN", label: "Mexican peso" },
  { code: "UYU", label: "Uruguayan peso" },
  { code: "NOK", label: "Norwegian krone" },
  { code: "SEK", label: "Swedish krona" },
  { code: "DKK", label: "Danish krone" },
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

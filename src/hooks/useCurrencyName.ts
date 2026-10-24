import { useLocale } from "next-intl";

/** "US dollar" / "dólar estadounidense": a currency's name in the app's language. */
function useCurrencyName() {
  const locale = useLocale();
  const names = new Intl.DisplayNames([locale], { type: "currency" });

  return function currencyName(code: string) {
    return names.of(code) ?? code;
  };
}

export default useCurrencyName;

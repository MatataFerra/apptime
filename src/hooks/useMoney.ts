import { useLocale } from "next-intl";

import { formatMoney } from "@/services/Summary";

import { type CurrencyCode, DEFAULT_CURRENCY, isCurrency } from "@/utils/constants/currencies";
import useUser from "@/hooks/useUser";

/** The currency picked in Settings (USD until one is chosen). */
export function useCurrency(): CurrencyCode {
  const { data: user } = useUser();
  const saved = user?.config?.currency;
  return isCurrency(saved) ? saved : DEFAULT_CURRENCY;
}

/**
 * formatMoney in the app's language and the user's currency (or
 * `defaultCurrency`, e.g. the one totals are shown in). Pass `currency`
 * per call for a shift saved in another one.
 */
function useMoney(defaultCurrency?: string | null) {
  const settings = useCurrency();
  const currency = defaultCurrency || settings;
  const locale = useLocale();

  return function money(
    value: number,
    options: { cents?: boolean; currency?: string | null } = {}
  ) {
    return formatMoney(value, {
      cents: options.cents,
      currency: options.currency || currency,
      locale,
    });
  };
}

export default useMoney;

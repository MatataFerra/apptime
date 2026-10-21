import type { HourlyType, ProductionType } from "@/types";

import useHourlyShifts from "@/hooks/useHourlyShifts";
import { useCurrency } from "@/hooks/useMoney";
import useProductionShifts from "@/hooks/useProductionShifts";

type Shift = HourlyType | ProductionType;

/**
 * Shifts in the currency totals are shown in, for totals that must not add
 * up different currencies, plus the other currencies the user has shifts
 * in and every shift (hours and counts don't depend on money).
 *
 * Totals are in the Settings currency, unless no shift uses it and they're
 * all in another one (e.g. Settings left on USD and every shift paid in
 * EUR): then the most used currency, so the screens don't show 0.
 */
function useShiftsInCurrency() {
  const settings = useCurrency();
  const { data: allHourly, isLoading: loadingHourly } = useHourlyShifts();
  const { data: allProduction, isLoading: loadingProduction } = useProductionShifts();

  const all: Shift[] = [...(allHourly ?? []), ...(allProduction ?? [])];
  const counts = new Map<string, number>();
  for (const shift of all) {
    const code = shift.currency ?? settings;
    counts.set(code, (counts.get(code) ?? 0) + 1);
  }
  const mostUsed = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const currency = counts.has(settings) || !mostUsed ? settings : mostUsed;

  function mine(s: Shift) {
    return (s.currency ?? settings) === currency;
  }

  /** The shifts paid in `code` (no currency = the Settings one). */
  function shiftsIn(code: string) {
    return {
      hourly: allHourly?.filter((s) => (s.currency ?? settings) === code),
      production: allProduction?.filter((s) => (s.currency ?? settings) === code),
    };
  }

  return {
    shiftsIn,
    /** The currency totals are in. */
    currency,
    /** True when that isn't the Settings one (no shift uses it). */
    notSettingsCurrency: currency !== settings,
    hourly: allHourly?.filter(mine),
    production: allProduction?.filter(mine),
    otherCurrencies: [...counts.keys()].filter((c) => c !== currency),
    /** Every shift, any currency: for hours and counts, which don't mix money. */
    allHourly,
    allProduction,
    isLoading: loadingHourly || loadingProduction,
  };
}

export default useShiftsInCurrency;

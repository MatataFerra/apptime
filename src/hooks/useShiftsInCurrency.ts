import type { HourlyType, ProductionType } from "@/types";

import useHourlyShifts from "@/hooks/useHourlyShifts";
import { useCurrency } from "@/hooks/useMoney";
import useProductionShifts from "@/hooks/useProductionShifts";

type Shift = HourlyType | ProductionType;

/**
 * Shifts in the user's currency (shifts saved without one count as it),
 * for totals that must not add up different currencies, plus the other
 * currencies the user has shifts in.
 */
function useShiftsInCurrency() {
  const currency = useCurrency();
  const { data: allHourly, isLoading: loadingHourly } = useHourlyShifts();
  const { data: allProduction, isLoading: loadingProduction } = useProductionShifts();

  function mine(s: Shift) {
    return (s.currency ?? currency) === currency;
  }
  const others = [...(allHourly ?? []), ...(allProduction ?? [])]
    .map((s) => s.currency ?? currency)
    .filter((c) => c !== currency);

  return {
    currency,
    hourly: allHourly?.filter(mine),
    production: allProduction?.filter(mine),
    otherCurrencies: [...new Set(others)],
    /** Every shift, any currency: for hours and counts, which don't mix money. */
    allHourly,
    allProduction,
    isLoading: loadingHourly || loadingProduction,
  };
}

export default useShiftsInCurrency;

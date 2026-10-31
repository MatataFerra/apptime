import { useMemo } from "react";

import { dayKey, makeConverter } from "@/services/ExchangeRates/convert";

import type { HourlyType, ProductionType } from "@/types";

import useExchangeRates from "@/hooks/useExchangeRates";
import useHourlyShifts from "@/hooks/useHourlyShifts";
import { useCurrency } from "@/hooks/useMoney";
import useProductionShifts from "@/hooks/useProductionShifts";

type Shift = HourlyType | ProductionType;

function shiftDay(shift: Shift) {
  const start = new Date(shift.startDate);
  return isNaN(start.valueOf()) ? null : dayKey(start);
}

/**
 * The same shift with its money in another currency. Earnings are linear
 * in the hourly rate and the value per item (taxes are percentages), so
 * scaling those two converts everything computed from the shift.
 */
function scaled<T extends Shift>(shift: T, factor: number, currency: string): T {
  return {
    ...shift,
    currency,
    ...("hourValue" in shift && shift.hourValue != null
      ? { hourValue: shift.hourValue * factor }
      : {}),
    ...("itemValue" in shift && shift.itemValue != null
      ? { itemValue: shift.itemValue * factor }
      : {}),
  };
}

/**
 * Shifts for totals, all in the Settings currency: shifts paid in another
 * one are converted at the rate of their own day (so past totals don't
 * move with the market). A shift whose rate isn't available yet keeps its
 * currency and is listed apart instead of being added in.
 *
 * If no shift can be shown in the Settings currency at all (no rates and
 * every shift in another one), totals use the most used currency instead.
 */
function useShiftsInCurrency() {
  const settings = useCurrency();
  const { data: rawHourly, isLoading: loadingHourly } = useHourlyShifts();
  const { data: rawProduction, isLoading: loadingProduction } = useProductionShifts();

  // What needs a rate: currencies other than the Settings one, and the
  // range of days they were worked.
  const foreign = useMemo(() => {
    const shifts = [...(rawHourly ?? []), ...(rawProduction ?? [])].filter(
      (s) => s.currency && s.currency !== settings
    );
    const days = shifts
      .map(shiftDay)
      .filter((d): d is string => !!d)
      .sort();
    const quotes = [...new Set(shifts.map((s) => s.currency as string))];
    return {
      from: days[0] ?? "",
      to: days[days.length - 1] ?? "",
      quotes: quotes.length ? [...quotes, settings] : [],
    };
  }, [rawHourly, rawProduction, settings]);

  const { rates, isLoading: loadingRates } = useExchangeRates(foreign);

  const { allHourly, allProduction, convertedFrom } = useMemo(() => {
    const convert = rates ? makeConverter(rates) : null;
    const converted = new Set<string>();

    function toSettings<T extends Shift>(shift: T): T {
      const code = shift.currency ?? settings;
      if (code === settings) return shift;
      const day = shiftDay(shift);
      const factor = convert && day ? convert(1, code, settings, day) : null;
      if (factor === null) return shift; // no rate: stays in its currency
      converted.add(code);
      return scaled(shift, factor, settings);
    }

    return {
      allHourly: rawHourly?.map(toSettings),
      allProduction: rawProduction?.map(toSettings),
      convertedFrom: [...converted],
    };
  }, [rawHourly, rawProduction, rates, settings]);

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

  /** The shifts in `code` after conversion (no currency = the Settings one). */
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
    /** True when that isn't the Settings one (no shift could be shown in it). */
    notSettingsCurrency: currency !== settings,
    hourly: allHourly?.filter(mine),
    production: allProduction?.filter(mine),
    /** Currencies still shown apart (no rate for them). */
    otherCurrencies: [...counts.keys()].filter((c) => c !== currency),
    /** Currencies that were converted into the Settings one. */
    convertedFrom,
    /** Every shift (converted where possible): hours and counts use all of them. */
    allHourly,
    allProduction,
    /** Only the shift lists (hours, counts and worked days don't need rates). */
    isLoadingShifts: loadingHourly || loadingProduction,
    isLoading: loadingHourly || loadingProduction || loadingRates,
  };
}

export default useShiftsInCurrency;

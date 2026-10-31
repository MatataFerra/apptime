"use client";

import { createContext, type ReactNode, use, useMemo, useSyncExternalStore } from "react";

import {
  summarizePeriod,
  summarizeWeek,
  weekStartsOnIndex,
  type WeekSummary,
} from "@/services/Summary";

import useMoney from "@/hooks/useMoney";
import useShiftsInCurrency from "@/hooks/useShiftsInCurrency";
import useUser from "@/hooks/useUser";

type Money = ReturnType<typeof useMoney>;

export type WeekState = {
  /**
   * The shift lists are in: the range, hours, shift count and which days
   * were worked can show. Never during SSR or hydration, so the server's
   * placeholders (built in the user's zone) are what hydrates.
   */
  shiftsReady: boolean;
  /** Exchange rates too: everything with money can show. */
  ready: boolean;
  today: Date;
  /** Every currency (converted where possible): hours, count, worked days. */
  worked: WeekSummary;
  /** Only the headline currency: money and bars. */
  week: WeekSummary;
  headline: string;
  money: Money;
  /** What else was earned this week, in currencies without a rate. */
  otherEarnings: { code: string; earned: number }[];
  convertedFrom: string[];
};

const WeekContext = createContext<WeekState | null>(null);

function subscribeToNothing() {
  return () => {};
}

/** False on the server and while hydrating, true after. */
function useHydrated() {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false
  );
}

/**
 * Computes this week once for every island of the card (earned, days,
 * legend, totals), each showing its placeholder until its part is ready.
 */
function WeekSummaryProvider({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const { data: user, isLoading: loadingUser } = useUser();
  const {
    allHourly,
    allProduction,
    isLoading,
    isLoadingShifts,
    otherCurrencies,
    convertedFrom,
    currency,
    shiftsIn,
  } = useShiftsInCurrency();
  const weekStartsOn = weekStartsOnIndex(user?.config?.weekStartsOn);

  // Hours, shift count and which days were worked include every currency.
  const worked = useMemo(
    () => summarizeWeek(allHourly, allProduction, { weekStartsOn }),
    [allHourly, allProduction, weekStartsOn]
  );

  // Money per currency this week; the headline is the usual currency
  // unless only another one earned something this week.
  const earnedByCurrency = [currency, ...otherCurrencies].map((code) => {
    const { hourly, production } = shiftsIn(code);
    return { code, earned: summarizePeriod(hourly, production, worked.from, worked.to).earned };
  });
  const headline =
    earnedByCurrency.find((c) => c.code === currency && c.earned > 0)?.code ??
    [...earnedByCurrency].sort((a, b) => b.earned - a.earned).find((c) => c.earned > 0)?.code ??
    currency;
  const money = useMoney(headline);
  const shown = shiftsIn(headline);
  const week = summarizeWeek(shown.hourly, shown.production, { weekStartsOn });

  const shiftsReady = hydrated && !loadingUser && !isLoadingShifts;

  const value: WeekState = {
    shiftsReady,
    ready: shiftsReady && !isLoading,
    today: new Date(),
    worked,
    week,
    headline,
    money,
    otherEarnings: earnedByCurrency.filter((c) => c.code !== headline && c.earned > 0),
    convertedFrom,
  };

  return <WeekContext value={value}>{children}</WeekContext>;
}

export function useWeek() {
  const state = use(WeekContext);
  if (!state) throw new Error("useWeek must be used inside WeekSummaryProvider");
  return state;
}

export default WeekSummaryProvider;

"use client";

import { useMemo } from "react";

import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { CalendarDays, Clock3, Layers, type LucideIcon, TrendingUp } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import Dashboard from "@/services/Dashboard";
import DateHumanizer from "@/services/Date";
import { compareWithPreviousMonth, summarizePeriod } from "@/services/Summary";

import Skeleton from "@/components/ui/Skeleton";

import { MODULE_THEMES, type ModuleTheme } from "@/utils/constants/modules";
import { cn } from "@/utils/helpers/styleMerger";
import useDateLocale from "@/hooks/useDateLocale";
import useMoney from "@/hooks/useMoney";
import useShiftsInCurrency from "@/hooks/useShiftsInCurrency";

function Stat({
  icon: Icon,
  theme,
  value,
  label,
  small,
}: {
  icon: LucideIcon;
  theme: ModuleTheme;
  value: string | number;
  label: string;
  small?: boolean;
}) {
  const colors = MODULE_THEMES[theme];

  return (
    <div className="flex flex-col gap-3.5 rounded-xl border border-border bg-surface p-3.5">
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-[10px]",
          colors.soft,
          colors.ink
        )}
      >
        <Icon className="size-4.5" strokeWidth={2} aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-0.5">
        <span className={cn("figure leading-none", small ? "text-xl" : "text-[1.875rem]")}>
          {value}
        </span>
        <span className="text-[0.8125rem] text-ink-muted">{label}</span>
      </div>
    </div>
  );
}

/** Month earnings against last month, plus all-time stats. */
function DashboardStats() {
  const t = useTranslations("dashboard.stats");
  const locale = useLocale();
  const dateLocale = useDateLocale();
  const {
    allHourly,
    allProduction,
    otherCurrencies,
    convertedFrom,
    currency,
    shiftsIn,
    isLoading,
  } = useShiftsInCurrency();

  // Money per currency this month; the headline is the usual currency
  // unless only another one earned something this month.
  const earnedThisMonth = [currency, ...otherCurrencies].map((code) => {
    const { hourly, production } = shiftsIn(code);
    return {
      code,
      earned: summarizePeriod(hourly, production, startOfMonth(new Date()), endOfMonth(new Date()))
        .earned,
    };
  });
  const headline =
    earnedThisMonth.find((c) => c.code === currency && c.earned > 0)?.code ??
    [...earnedThisMonth].sort((a, b) => b.earned - a.earned).find((c) => c.earned > 0)?.code ??
    currency;
  const money = useMoney(headline);
  const { hourly: hourlies, production: productions } = shiftsIn(headline);

  // Hours, shift count and last shift count every shift, any currency.
  const stats = useMemo(
    () =>
      allHourly
        ? new Dashboard(allHourly, allProduction ?? []).dashboardData()
        : {
            shiftsLen: 0,
            hoursWorked: 0,
            averageHoursWorkedPerDay: 0,
            lastDayRegistered: "",
          },
    [allHourly, allProduction]
  );

  const month = useMemo(
    () => compareWithPreviousMonth(hourlies, productions),
    [hourlies, productions]
  );

  if (isLoading) {
    return (
      <div className="grid w-full grid-cols-2 gap-2.5">
        <Skeleton classes="col-span-2 h-28 rounded-xl" />
        <Skeleton classes="h-28 rounded-xl" />
        <Skeleton classes="h-28 rounded-xl" />
      </div>
    );
  }

  const lastDay = new Date(stats.lastDayRegistered);
  const lastDayLabel = lastDay.valueOf()
    ? new DateHumanizer("short").humanizeDate(lastDay, { locale })
    : t("none_yet");
  const previousMonth = format(subMonths(new Date(), 1), "LLLL", { locale: dateLocale });
  // Money in other currencies this month, listed apart (never added up).
  const otherThisMonth = earnedThisMonth.filter((c) => c.code !== headline && c.earned > 0);
  const change = month.change;

  return (
    <div className="grid w-full grid-cols-2 gap-2.5">
      <section className="col-span-2 flex flex-col gap-3 rounded-xl bg-surface-inverse p-4 text-ink-inverse">
        <span className="text-[0.8125rem] text-ink-inverse/70">
          {t("earned_in", { month: format(new Date(), "LLLL", { locale: dateLocale }) })}
        </span>
        <span className="figure text-[3.25rem] leading-[0.9] text-live">
          {money(month.current.earned)}
        </span>
        {convertedFrom.length > 0 ? (
          <span className="text-xs text-ink-inverse/60">
            {t("converted", { currencies: convertedFrom.join(", ") })}
          </span>
        ) : null}
        {otherThisMonth.length > 0 ? (
          <span className="text-[0.8125rem] text-ink-inverse/80">
            {t("also", {
              others: otherThisMonth
                .map((other) => `${money(other.earned, { currency: other.code })} (${other.code})`)
                .join(", "),
            })}
          </span>
        ) : null}
        {month.previousFull.earned > 0 ? (
          <div className="flex flex-col gap-2.5 border-t border-ink-inverse/15 pt-3">
            <div className="flex items-baseline justify-between gap-3 text-[0.8125rem]">
              <span className="text-ink-inverse/70">
                {t("previous", { month: previousMonth, amount: money(month.previousFull.earned) })}
              </span>
              <span className="font-semibold">
                {(month.shareOfPrevious ?? 0) >= 100
                  ? t("past_it")
                  : t("share_so_far", { share: month.shareOfPrevious ?? 0 })}
              </span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-ink-inverse/12"
              role="progressbar"
              aria-label={t("progress", { month: previousMonth })}
              aria-valuenow={Math.min(100, month.shareOfPrevious ?? 0)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-live"
                style={{ width: `${Math.min(100, month.shareOfPrevious ?? 0)}%` }}
              />
            </div>
            {change !== null ? (
              <span
                className={cn(
                  "flex items-center gap-1 text-[0.8125rem] font-semibold",
                  change >= 0 ? "text-live" : "text-production-bright"
                )}
              >
                <TrendingUp
                  className={cn("size-4", change < 0 && "-scale-y-100")}
                  aria-hidden="true"
                />
                {t("change", {
                  change: `${change >= 0 ? "+" : ""}${change}`,
                  month: previousMonth,
                  day: new Date().getDate(),
                })}
              </span>
            ) : null}
          </div>
        ) : (
          <span className="text-[0.8125rem] text-ink-inverse/70">
            {t("no_previous", { month: previousMonth })}
          </span>
        )}
      </section>
      <Stat icon={Clock3} theme="track" value={`${stats.hoursWorked}h`} label={t("hours_worked")} />
      <Stat icon={Layers} theme="production" value={stats.shiftsLen} label={t("shifts_saved")} />
      <Stat
        icon={TrendingUp}
        theme="insight"
        value={`${stats.averageHoursWorkedPerDay}h`}
        label={t("average_per_day")}
      />
      <Stat icon={CalendarDays} theme="fast" value={lastDayLabel} label={t("last_shift")} small />
    </div>
  );
}

export default DashboardStats;

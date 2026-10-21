"use client";

import { useMemo } from "react";

import { format, isSameDay } from "date-fns";

import { formatHours, summarizePeriod, summarizeWeek, weekStartsOnIndex } from "@/services/Summary";

import Skeleton from "@/components/ui/Skeleton";

import { cn } from "@/utils/helpers/styleMerger";
import useMoney from "@/hooks/useMoney";
import useShiftsInCurrency from "@/hooks/useShiftsInCurrency";
import useUser from "@/hooks/useUser";

/**
 * This week at a glance: earned, hours, shifts and one bar per day.
 * Bars are coloured by shift type (hourly green, per piece plum) and
 * public holidays in amber.
 */
function WeekSummary() {
  const { data: user } = useUser();
  const { allHourly, allProduction, isLoading, otherCurrencies, currency, shiftsIn } =
    useShiftsInCurrency();
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
  const otherEarnings = earnedByCurrency.filter((c) => c.code !== headline && c.earned > 0);

  if (isLoading) {
    return <Skeleton classes="h-52 w-full rounded-2xl" />;
  }

  const max = Math.max(...week.days.map((d) => d.hourly + d.production), 1);
  const today = new Date();

  return (
    <section
      aria-label="This week"
      className="flex flex-col gap-4 rounded-xl bg-surface-inverse px-4.5 pt-4.5 pb-4 text-ink-inverse"
    >
      <div className="flex items-baseline justify-between text-[0.8125rem] text-ink-inverse/70">
        <span>This week</span>
        <span>
          {format(week.from, "EEE d")} to {format(week.to, "EEE d")}
        </span>
      </div>

      <dl className="grid grid-cols-3 gap-2">
        <div className="flex flex-col-reverse gap-0.5">
          <dt className="text-xs text-ink-inverse/70">earned</dt>
          <dd className="figure text-[1.875rem] leading-none text-live">
            {money(week.earned, { cents: week.earned < 1000 })}
          </dd>
        </div>
        <div className="flex flex-col-reverse gap-0.5">
          <dt className="text-xs text-ink-inverse/70">worked</dt>
          <dd className="figure text-[1.875rem] leading-none">{formatHours(worked.minutes)}</dd>
        </div>
        <div className="flex flex-col-reverse gap-0.5">
          <dt className="text-xs text-ink-inverse/70">
            {worked.shifts === 1 ? "shift" : "shifts"}
          </dt>
          <dd className="figure text-[1.875rem] leading-none">{worked.shifts}</dd>
        </div>
      </dl>

      <ol className="grid h-14 grid-cols-7 items-end gap-1.5" aria-label="Earnings per day">
        {week.days.map((day, i) => {
          const total = day.hourly + day.production;
          // Worked, but only in another currency: a neutral bar, not a money one.
          const otherOnly = total === 0 && worked.days[i].hourly + worked.days[i].production > 0;
          const isToday = isSameDay(day.date, today);
          const height = total > 0 ? Math.max(12, Math.round((total / max) * 100)) : 0;
          const label = `${format(day.date, "EEEE")}: ${
            total > 0 ? money(total) : otherOnly ? "shifts in another currency" : "no shifts"
          }`;

          return (
            <li
              key={day.date.toISOString()}
              className="flex h-full flex-col items-center gap-1"
              aria-label={label}
            >
              <div className="flex w-full flex-1 flex-col justify-end">
                {total > 0 ? (
                  <div
                    className="flex w-full flex-col overflow-hidden rounded-[4px]"
                    style={{ height: `${height}%` }}
                  >
                    {day.production > 0 ? (
                      <div
                        className="w-full bg-production-bright"
                        style={{ flexGrow: day.production }}
                      />
                    ) : null}
                    {day.hourly > 0 ? (
                      <div
                        className={cn("w-full", day.publicHoliday ? "bg-fast-bright" : "bg-live")}
                        style={{ flexGrow: day.hourly }}
                      />
                    ) : null}
                  </div>
                ) : otherOnly ? (
                  <div className="h-[30%] w-full rounded-[4px] bg-ink-inverse/35" />
                ) : (
                  <div
                    className={cn(
                      "h-1 w-full rounded-[4px] bg-ink-inverse/20",
                      isToday &&
                        "outline-[1.5px] outline-offset-2 outline-ink-inverse outline-solid"
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  "text-[0.625rem]",
                  isToday ? "font-semibold text-ink-inverse" : "text-ink-inverse/60"
                )}
                aria-hidden="true"
              >
                {format(day.date, "EEEEE")}
              </span>
            </li>
          );
        })}
      </ol>
      {otherEarnings.length > 0 ? (
        <p className="text-xs text-ink-inverse/70">
          Earned in {headline}. Also this week:{" "}
          {otherEarnings
            .map((other) => `${money(other.earned, { currency: other.code })} (${other.code})`)
            .join(", ")}
          .
        </p>
      ) : null}
    </section>
  );
}

export default WeekSummary;

"use client";

import { useMemo } from "react";

import { format, isSameDay, isSameMonth } from "date-fns";
import { useLocale, useTranslations } from "next-intl";

import { formatHours, summarizePeriod, summarizeWeek, weekStartsOnIndex } from "@/services/Summary";

import Skeleton from "@/components/ui/Skeleton";

import { cn } from "@/utils/helpers/styleMerger";
import useDateLocale from "@/hooks/useDateLocale";
import useMoney from "@/hooks/useMoney";
import useShiftsInCurrency from "@/hooks/useShiftsInCurrency";
import useUser from "@/hooks/useUser";

/**
 * This week at a glance: earned, hours, shifts and one bar per day.
 * Bars are coloured by shift type (hourly green, per piece plum) and
 * public holidays in amber, in the softer --week-bar-* tones. Each day
 * reads like a calendar: its initial ("L M X J V S D") over its date,
 * today's date on a filled circle. Hours and shifts sit in the footer so
 * the money leads.
 */
function WeekSummary() {
  const { data: user } = useUser();
  const t = useTranslations("home.week");
  const locale = useDateLocale();
  const intlLocale = useLocale();
  const {
    allHourly,
    allProduction,
    isLoading,
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
  const otherEarnings = earnedByCurrency.filter((c) => c.code !== headline && c.earned > 0);

  if (isLoading) {
    return <Skeleton classes="h-80 w-full rounded-xl" />;
  }

  const max = Math.max(...week.days.map((d) => d.hourly + d.production), 1);
  const today = new Date();
  const weekday = new Intl.DateTimeFormat(intlLocale, { weekday: "narrow" });
  const range = t("range", {
    from: format(week.from, isSameMonth(week.from, week.to) ? "d" : "d MMM", { locale }),
    to: format(week.to, "d MMM", { locale }),
  });

  return (
    <section
      aria-label={t("title")}
      className="flex flex-col gap-5 rounded-xl bg-surface-inverse px-5 pt-5 pb-4.5 text-ink-inverse"
    >
      <header className="flex items-baseline justify-between gap-3 text-[0.8125rem] text-ink-inverse/70">
        <h2 className="font-medium text-ink-inverse/85">{t("title")}</h2>
        <span className="tabular-nums">{range}</span>
      </header>

      <dl className="-mt-1 flex flex-col-reverse gap-1">
        <dt className="text-[0.8125rem] text-ink-inverse/60">{t("earned")}</dt>
        <dd className="figure text-[2.5rem] leading-none text-live">
          {money(week.earned, { cents: week.earned < 1000 })}
        </dd>
      </dl>

      <ol className="grid grid-cols-7 gap-2" aria-label={t("per_day")}>
        {week.days.map((day, i) => {
          const total = day.hourly + day.production;
          // Worked, but only in another currency: a neutral bar, not a money one.
          const otherOnly = total === 0 && worked.days[i].hourly + worked.days[i].production > 0;
          const isToday = isSameDay(day.date, today);
          const height = total > 0 ? Math.max(10, Math.round((total / max) * 100)) : 0;
          const label = `${format(day.date, "EEEE d", { locale })}: ${
            total > 0 ? money(total) : otherOnly ? t("other_currency") : t("no_shifts")
          }`;

          return (
            <li
              key={day.date.toISOString()}
              className="flex flex-col items-center gap-2"
              aria-label={label}
              aria-current={isToday ? "date" : undefined}
            >
              <div className="flex h-20 w-full flex-col justify-end">
                {total > 0 ? (
                  <div
                    className="flex w-full flex-col overflow-hidden rounded-md"
                    style={{ height: `${height}%` }}
                  >
                    {day.production > 0 ? (
                      <div
                        className="w-full bg-week-bar-production"
                        style={{ flexGrow: day.production }}
                      />
                    ) : null}
                    {day.hourly > 0 ? (
                      <div
                        className={cn(
                          "w-full",
                          day.publicHoliday ? "bg-week-bar-holiday" : "bg-week-bar-hourly"
                        )}
                        style={{ flexGrow: day.hourly }}
                      />
                    ) : null}
                  </div>
                ) : otherOnly ? (
                  <div className="h-[30%] w-full rounded-md bg-ink-inverse/35" />
                ) : (
                  <div className="h-1 w-full rounded-full bg-ink-inverse/15" />
                )}
              </div>
              <span className="flex flex-col items-center gap-1" aria-hidden="true">
                <span
                  className={cn(
                    "text-[0.6875rem] leading-none font-medium",
                    isToday ? "text-ink-inverse" : "text-ink-inverse/50"
                  )}
                >
                  {weekday.format(day.date)}
                </span>
                <span
                  className={cn(
                    "grid size-7 place-items-center rounded-full text-sm leading-none tabular-nums",
                    isToday
                      ? "bg-ink-inverse font-semibold text-surface-inverse"
                      : "text-ink-inverse/80"
                  )}
                >
                  {format(day.date, "d")}
                </span>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-col gap-2 border-t border-ink-inverse/10 pt-3.5">
        <dl className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-[0.8125rem] text-ink-inverse/60">
          <div className="flex flex-row-reverse items-baseline gap-1.5">
            <dt>{t("worked")}</dt>
            <dd className="figure text-lg leading-none text-ink-inverse">
              {formatHours(worked.minutes)}
            </dd>
          </div>
          <div className="flex flex-row-reverse items-baseline gap-1.5">
            <dt>{t("shifts", { count: worked.shifts })}</dt>
            <dd className="figure text-lg leading-none text-ink-inverse">{worked.shifts}</dd>
          </div>
        </dl>
        {convertedFrom.length > 0 ? (
          <p className="text-xs text-ink-inverse/55">
            {t("converted", { currencies: convertedFrom.join(", ") })}
          </p>
        ) : null}
        {otherEarnings.length > 0 ? (
          <p className="text-xs text-ink-inverse/65">
            {t("also_earned", {
              currency: headline,
              others: otherEarnings
                .map((other) => `${money(other.earned, { currency: other.code })} (${other.code})`)
                .join(", "),
            })}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default WeekSummary;

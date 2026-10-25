"use client";

import { type ReactNode, useMemo } from "react";

import { format, isSameDay, isSameMonth } from "date-fns";
import { useLocale, useTranslations } from "next-intl";

import {
  type DayShift,
  type DaySummary,
  formatHours,
  summarizePeriod,
  summarizeWeek,
  weekStartsOnIndex,
} from "@/services/Summary";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import Skeleton from "@/components/ui/Skeleton";

import { cn } from "@/utils/helpers/styleMerger";
import useDateLocale from "@/hooks/useDateLocale";
import useMoney from "@/hooks/useMoney";
import useShiftsInCurrency from "@/hooks/useShiftsInCurrency";
import useUser from "@/hooks/useUser";

function segmentColor(shift: DayShift) {
  if (shift.kind === "production") return "bg-week-bar-production";
  return shift.publicHoliday ? "bg-week-bar-holiday" : "bg-week-bar-hourly";
}

/**
 * Tapping a day's bar: which shifts made it ("Box Maker 07:00–12:00
 * $125 · Web Developer 18:00–23:00 $140"), so two jobs the same day can
 * be told apart.
 */
function DayDetail({
  day,
  money,
  label,
  children,
}: {
  day: DaySummary;
  money: (value: number) => string;
  label: string;
  children: ReactNode;
}) {
  const t = useTranslations("home.week");
  const tk = useTranslations("shift.kind");
  const locale = useDateLocale();
  function time(date: Date) {
    return format(date, "p", { locale });
  }
  const total = day.shifts.reduce((sum, shift) => sum + shift.earned, 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className="flex flex-col items-center gap-2 rounded-lg outline-hidden transition-opacity focus-visible:ring-2 focus-visible:ring-ink-inverse/60 data-[state=open]:opacity-80"
        >
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" collisionPadding={16} className="w-64 p-3">
        <p className="mb-2 text-[0.8125rem] font-semibold text-ink capitalize">
          {format(day.date, "EEEE d MMMM", { locale })}
        </p>
        <ul className="flex flex-col gap-2">
          {day.shifts.map((shift) => (
            <li key={shift.start.toISOString()} className="flex items-start gap-2.5">
              <span
                className={cn("mt-1 size-2.5 shrink-0 rounded-full", segmentColor(shift))}
                aria-hidden="true"
              />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium text-ink">
                  {shift.name ?? tk(shift.kind)}
                </span>
                <span className="text-xs text-ink-muted tabular-nums">
                  {shift.end ? `${time(shift.start)}–${time(shift.end)}` : time(shift.start)}
                  {shift.publicHoliday ? ` · ${t("holiday")}` : ""}
                </span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-ink tabular-nums">
                {money(shift.earned)}
              </span>
            </li>
          ))}
        </ul>
        {day.shifts.length > 1 ? (
          <p className="mt-2 flex justify-between border-t border-border pt-2 text-sm font-semibold text-ink tabular-nums">
            <span>{t("day_total")}</span>
            <span>{money(total)}</span>
          </p>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

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

          const bar = (
            <div className="flex h-20 w-full flex-col justify-end">
              {total > 0 ? (
                // One segment per shift, so two jobs the same day read as two.
                <div
                  className="flex w-full flex-col-reverse gap-px overflow-hidden rounded-md"
                  style={{ height: `${height}%` }}
                >
                  {day.shifts.map((shift) => (
                    <div
                      key={shift.start.toISOString()}
                      className={cn("w-full", segmentColor(shift))}
                      style={{ flexGrow: Math.max(shift.earned, total * 0.04) }}
                    />
                  ))}
                </div>
              ) : otherOnly ? (
                <div className="h-[30%] w-full rounded-md bg-ink-inverse/35" />
              ) : (
                <div className="h-1 w-full rounded-full bg-ink-inverse/15" />
              )}
            </div>
          );
          const date = (
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
          );

          return (
            <li
              key={day.date.toISOString()}
              className="flex flex-col"
              aria-current={isToday ? "date" : undefined}
            >
              {day.shifts.length > 0 ? (
                <DayDetail day={day} money={money} label={label}>
                  {bar}
                  {date}
                </DayDetail>
              ) : (
                <div className="flex flex-col items-center gap-2" aria-label={label}>
                  {bar}
                  {date}
                </div>
              )}
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

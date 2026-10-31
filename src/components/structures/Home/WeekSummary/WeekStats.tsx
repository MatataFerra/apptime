"use client";

import type { ReactNode } from "react";

import { useTranslations } from "next-intl";

import { formatHours } from "@/services/Summary";

import Skeleton from "@/components/ui/Skeleton";

import { cn } from "@/utils/helpers/styleMerger";
import useDateLocale from "@/hooks/useDateLocale";

import { SOURCE_COLOR, weekRangeParts } from "./shared";
import { useWeek } from "./WeekSummaryProvider";

/** A placeholder that reads on the dark card. */
function InverseSkeleton({ classes }: { classes: string }) {
  return <Skeleton classes={cn("bg-ink-inverse/15", classes)} aria-hidden="true" />;
}

/**
 * The week's dates. The server already wrote them (`fallback`); once on
 * the client they follow the week start and date order in the cache, so a
 * change in Settings shows without a reload.
 */
export function WeekRange({ fallback }: { fallback: ReactNode }) {
  const { shiftsReady, worked } = useWeek();
  const t = useTranslations("home.week");
  const locale = useDateLocale();
  if (!shiftsReady) return fallback;
  return <>{t("range", weekRangeParts(worked.from, worked.to, locale))}</>;
}

/** The headline figure: what this week earned. Needs the exchange rates. */
export function WeekEarned() {
  const { ready, week, money } = useWeek();
  if (!ready) {
    return (
      <dd>
        <InverseSkeleton classes="h-10 w-36" />
      </dd>
    );
  }
  return (
    <dd className="figure text-[2.5rem] leading-none text-live">
      {money(week.earned, { cents: week.earned < 1000 })}
    </dd>
  );
}

const LEGEND: {
  source: keyof typeof SOURCE_COLOR;
  title: "track" | "fast_charge" | "production";
}[] = [
  { source: "track", title: "track" },
  { source: "fast", title: "fast_charge" },
  { source: "production", title: "production" },
];

/** What the colours mean, only for what this week has (and the hatching, if any holiday). */
export function WeekLegend() {
  const { ready, week } = useWeek();
  const t = useTranslations("home.week");
  const tm = useTranslations("modules");
  if (!ready) return null;

  const shifts = week.days.flatMap((day) => day.shifts);
  const shown = LEGEND.filter((item) => shifts.some((shift) => shift.source === item.source));
  const holiday = shifts.some((shift) => shift.publicHoliday);
  if (shown.length < 2 && !holiday) return null;

  return (
    <ul className="-mt-1 flex flex-wrap gap-x-3.5 gap-y-1 text-[0.6875rem] text-ink-inverse/65">
      {shown.map((item) => (
        <li key={item.source} className="flex items-center gap-1.5">
          <span
            className={cn("size-2 rounded-[2px]", SOURCE_COLOR[item.source])}
            aria-hidden="true"
          />
          {tm(`${item.title}.title`)}
        </li>
      ))}
      {holiday ? (
        <li className="flex items-center gap-1.5">
          <span
            className="size-2 rounded-[2px] bg-ink-inverse/70 holiday-hatch"
            aria-hidden="true"
          />
          {t("holiday")}
        </li>
      ) : null}
    </ul>
  );
}

/**
 * Hours and shifts, as soon as the shift lists are in (they don't need
 * rates); the currency notes once the money is ready.
 */
export function WeekTotals() {
  const { shiftsReady, ready, worked, convertedFrom, otherEarnings, headline, money } = useWeek();
  const t = useTranslations("home.week");

  return (
    <>
      <dl className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-[0.8125rem] text-ink-inverse/60">
        {shiftsReady ? (
          <>
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
          </>
        ) : (
          <>
            <InverseSkeleton classes="h-[1.125rem] w-24" />
            <InverseSkeleton classes="h-[1.125rem] w-20" />
          </>
        )}
      </dl>
      {ready && convertedFrom.length > 0 ? (
        <p className="text-xs text-ink-inverse/55">
          {t("converted", { currencies: convertedFrom.join(", ") })}
        </p>
      ) : null}
      {ready && otherEarnings.length > 0 ? (
        <p className="text-xs text-ink-inverse/65">
          {t("also_earned", {
            currency: headline,
            others: otherEarnings
              .map((other) => `${money(other.earned, { currency: other.code })} (${other.code})`)
              .join(", "),
          })}
        </p>
      ) : null}
    </>
  );
}

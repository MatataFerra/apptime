import { addDays, format, isSameDay, isSameMonth, type Locale as DateLocale } from "date-fns";

import type { DayShift } from "@/services/Summary";

import { datePattern } from "@/utils/helpers/dateFormats";
import { cn } from "@/utils/helpers/styleMerger";

/*
 * Pieces shared by the server shell (index.tsx) and the client islands, so
 * what the server paints and what replaces it once the data is in match.
 * No hooks and no "use client": they render on either side.
 */

export const SOURCE_COLOR: Record<DayShift["source"], string> = {
  track: "bg-week-bar-track",
  fast: "bg-week-bar-fast",
  production: "bg-week-bar-production",
};

/** The module's hue (Track green, Fast charge yellow, Production plum); holidays hatched. */
export function segmentColor(shift: DayShift) {
  return cn(SOURCE_COLOR[shift.source], shift.publicHoliday && "holiday-hatch");
}

/** "26 to 31 Oct" / "Oct 26 to 31": the month once when both days share it. */
export function weekRangeParts(from: Date, to: Date, locale: DateLocale) {
  const sameMonth = isSameMonth(from, to);
  const monthFirst = datePattern(locale, "dayMonth") !== "d MMM";
  return {
    from: format(from, sameMonth && !monthFirst ? "d" : datePattern(locale, "dayMonth"), {
      locale,
    }),
    to: format(to, sameMonth && monthFirst ? "d" : datePattern(locale, "dayMonth"), { locale }),
  };
}

export type CalendarDay = { key: string; initial: string; day: string; isToday: boolean };

/** The seven days from `from`, as the calendar row reads them ("L 19", "M 20"…). */
export function calendarDays(from: Date, today: Date, intlLocale: string): CalendarDay[] {
  const weekday = new Intl.DateTimeFormat(intlLocale, { weekday: "narrow" });
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(from, i);
    return {
      key: date.toISOString(),
      initial: weekday.format(date),
      day: format(date, "d"),
      isToday: isSameDay(date, today),
    };
  });
}

/** A day's initial over its date, today's on a filled circle. */
export function DayDate({ initial, day, isToday }: Omit<CalendarDay, "key">) {
  return (
    <span className="flex flex-col items-center gap-1" aria-hidden="true">
      <span
        className={cn(
          "text-[0.6875rem] leading-none font-medium",
          isToday ? "text-ink-inverse" : "text-ink-inverse/50"
        )}
      >
        {initial}
      </span>
      <span
        className={cn(
          "grid size-7 place-items-center rounded-full text-sm leading-none tabular-nums",
          isToday ? "bg-ink-inverse font-semibold text-surface-inverse" : "text-ink-inverse/80"
        )}
      >
        {day}
      </span>
    </span>
  );
}

/** The bar area of a day; `children` is the bar itself. */
export function BarSlot({ children }: { children: React.ReactNode }) {
  return <div className="flex h-[5.75rem] w-full flex-col justify-end">{children}</div>;
}

/** A day with nothing (yet): the thin baseline. */
export function EmptyBar({ loading = false }: { loading?: boolean }) {
  return (
    <div className={cn("h-1 w-full rounded-full bg-ink-inverse/15", loading && "animate-pulse")} />
  );
}

"use client";

import type { ReactNode } from "react";

import { format } from "date-fns";
import { useLocale, useTranslations } from "next-intl";

import type { DaySummary } from "@/services/Summary";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";

import { datePattern } from "@/utils/helpers/dateFormats";
import { cn } from "@/utils/helpers/styleMerger";
import useDateLocale from "@/hooks/useDateLocale";

import { BarSlot, calendarDays, DayDate, EmptyBar, segmentColor, SOURCE_COLOR } from "./shared";
import { useWeek } from "./WeekSummaryProvider";

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
          {format(day.date, datePattern(locale, "longWeekdayDayMonth"), { locale })}
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

/** The bar of a day: one segment per shift, stacked, in its module's colour. */
function DayBar({ day, max, otherOnly }: { day: DaySummary; max: number; otherOnly: boolean }) {
  const total = day.hourly + day.production;
  const height = total > 0 ? Math.max(10, Math.round((total / max) * 100)) : 0;

  return (
    <BarSlot>
      {/* More than one shift that day: a dot each, in its colour, over the bar. */}
      {day.shifts.length > 1 ? (
        <span
          className="mb-1.5 flex h-1.5 justify-center gap-[3px]"
          data-testid="day-dots"
          aria-hidden="true"
        >
          {day.shifts.map((shift) => (
            <span
              key={shift.start.toISOString()}
              className={cn("size-1.5 rounded-full", SOURCE_COLOR[shift.source])}
            />
          ))}
        </span>
      ) : null}
      {total > 0 ? (
        <div
          className="flex max-h-20 w-full flex-col-reverse overflow-hidden rounded-md"
          style={{ height: `${(height / 100) * 5}rem` }}
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
        // Worked, but only in another currency: a neutral bar, not a money one.
        <div className="h-[30%] w-full rounded-md bg-ink-inverse/35" />
      ) : (
        <EmptyBar />
      )}
    </BarSlot>
  );
}

/**
 * One column per day, its bar over its date. Until the money is ready it
 * shows `placeholder` (the server's calendar row, same dates).
 */
function WeekDays({ placeholder }: { placeholder: ReactNode }) {
  const { ready, week, worked, money, today } = useWeek();
  const t = useTranslations("home.week");
  const locale = useDateLocale();
  const intlLocale = useLocale();

  if (!ready) return placeholder;

  const max = Math.max(...week.days.map((d) => d.hourly + d.production), 1);
  const dates = calendarDays(week.from, today, intlLocale);

  return (
    <ol className="grid grid-cols-7 gap-2" aria-label={t("per_day")}>
      {week.days.map((day, i) => {
        const total = day.hourly + day.production;
        const otherOnly = total === 0 && worked.days[i].hourly + worked.days[i].production > 0;
        const { isToday } = dates[i];
        const label = `${format(day.date, "EEEE d", { locale })}: ${
          total > 0 ? money(total) : otherOnly ? t("other_currency") : t("no_shifts")
        }`;
        const content = (
          <>
            <DayBar day={day} max={max} otherOnly={otherOnly} />
            <DayDate {...dates[i]} />
          </>
        );

        return (
          <li
            key={dates[i].key}
            className="flex flex-col"
            aria-current={isToday ? "date" : undefined}
          >
            {day.shifts.length > 0 ? (
              <DayDetail day={day} money={money} label={label}>
                {content}
              </DayDetail>
            ) : (
              <div className="flex flex-col items-center gap-2" aria-label={label}>
                {content}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default WeekDays;

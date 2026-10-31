import { useTranslations } from "next-intl";

import { BarSlot, type CalendarDay, DayDate, EmptyBar } from "./shared";
import WeekDays from "./WeekDays";
import { WeekEarned, WeekLegend, WeekRange, WeekTotals } from "./WeekStats";
import WeekSummaryProvider from "./WeekSummaryProvider";

/**
 * This week at a glance: earned, hours, shifts and one bar per day.
 * Bars are coloured by shift type (hourly green, per piece plum) and
 * public holidays hatched, in the softer --week-bar-* tones. Each day
 * reads like a calendar: its initial ("L M X J V S D") over its date,
 * today's date on a filled circle. Hours and shifts sit in the footer so
 * the money leads.
 *
 * The frame, title, range and calendar row come from the server
 * (`range`, `days`) and paint with the first HTML; each island fills in
 * as its data arrives: hours and shifts with the shift lists, money,
 * bars and legend once the rates are in too.
 */
function WeekSummaryCard({ range, days }: { range: string; days: CalendarDay[] }) {
  const t = useTranslations("home.week");

  const placeholder = (
    <ol className="grid grid-cols-7 gap-2" aria-label={t("per_day")} aria-busy="true">
      {days.map(({ key, ...date }) => (
        <li key={key} className="flex flex-col" aria-current={date.isToday ? "date" : undefined}>
          <div className="flex flex-col items-center gap-2">
            <BarSlot>
              <EmptyBar loading />
            </BarSlot>
            <DayDate {...date} />
          </div>
        </li>
      ))}
    </ol>
  );

  return (
    <section
      aria-label={t("title")}
      className="flex flex-col gap-5 rounded-xl bg-surface-inverse px-5 pt-5 pb-4.5 text-ink-inverse"
    >
      <WeekSummaryProvider>
        <header className="flex items-baseline justify-between gap-3 text-[0.8125rem] text-ink-inverse/70">
          <h2 className="font-medium text-ink-inverse/85">{t("title")}</h2>
          <span className="tabular-nums">
            <WeekRange fallback={range} />
          </span>
        </header>

        <dl className="-mt-1 flex flex-col-reverse gap-1">
          <dt className="text-[0.8125rem] text-ink-inverse/60">{t("earned")}</dt>
          <WeekEarned />
        </dl>

        <WeekDays placeholder={placeholder} />

        <WeekLegend />

        <div className="flex flex-col gap-2 border-t border-ink-inverse/10 pt-3.5">
          <WeekTotals />
        </div>
      </WeekSummaryProvider>
    </section>
  );
}

export default WeekSummaryCard;

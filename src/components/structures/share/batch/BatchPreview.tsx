"use client";

import type { ReactNode } from "react";

import { format } from "date-fns";
import { useTranslations } from "next-intl";

import type { BatchDay } from "@/utils/helpers/batchShifts";
import { datePattern } from "@/utils/helpers/dateFormats";
import { cn } from "@/utils/helpers/styleMerger";
import useDateLocale from "@/hooks/useDateLocale";

import type { BatchSchedule } from "./useBatchSchedule";

/** Written out in full so Tailwind picks them up. */
const CHECKBOX_ACCENT = {
  fast: "accent-[var(--fast)]",
  production: "accent-[var(--production)]",
} as const;

type Props = {
  schedule: BatchSchedule;
  theme: keyof typeof CHECKBOX_ACCENT;
  /** Totals shown next to the title (time, money…). */
  summary: ReactNode;
  /** Something to fill in per day, e.g. how many bins. Not shown on clashing days. */
  renderExtra?: (day: BatchDay, on: boolean) => ReactNode;
};

/** Every day of a batch: tick or untick it; days already logged are shown, not saved. */
function BatchPreview({ schedule, theme, summary, renderExtra }: Props) {
  const tb = useTranslations("shift.batch");
  const dateLocale = useDateLocale();
  const { days, chosen, clashes, left } = schedule;

  if (days.length === 0) return null;

  return (
    <section aria-labelledby="batch-preview" className="w-full">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 id="batch-preview" className="text-sm font-medium text-ink">
          {tb("preview", { count: chosen.length, total: days.length })}
        </h2>
        <span className="text-sm text-ink-muted">{summary}</span>
      </div>
      <ul className="divide-y divide-border rounded-md border border-border">
        {days.map((day) => {
          const clash = clashes.has(day.key);
          const on = !clash && !left.has(day.key);
          return (
            <li key={day.key} className="flex min-h-11 items-center gap-3 px-3 py-1.5 text-sm">
              <label
                className={cn(
                  "flex flex-1 items-center gap-3 py-0.5",
                  clash ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                  !on && !clash && "text-ink-muted line-through"
                )}
              >
                <input
                  type="checkbox"
                  className={cn("size-4", CHECKBOX_ACCENT[theme])}
                  checked={on}
                  disabled={clash}
                  onChange={() => schedule.toggleDay(day.key)}
                />
                <span className="flex-1 capitalize">
                  {format(day.start, datePattern(dateLocale, "weekdayDayMonth"), {
                    locale: dateLocale,
                  })}
                </span>
                <span className="text-ink-muted tabular-nums">
                  {format(day.start, "p", { locale: dateLocale })}–
                  {format(day.end, "p", { locale: dateLocale })}
                </span>
              </label>
              {clash ? (
                <span className="rounded-sm bg-surface-sunken px-1.5 py-0.5 text-xs text-ink-muted">
                  {tb("overlap")}
                </span>
              ) : renderExtra ? (
                renderExtra(day, on)
              ) : null}
            </li>
          );
        })}
      </ul>
      {clashes.size > 0 ? (
        <p className="mt-1.5 text-xs text-ink-muted">
          {tb("overlap_hint", { count: clashes.size })}
        </p>
      ) : null}
    </section>
  );
}

export default BatchPreview;

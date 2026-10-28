"use client";

import { type ReactNode, useState } from "react";

import { format } from "date-fns";
import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";

import Input from "@/components/ui/Input";

import type { BatchDay } from "@/utils/helpers/batchShifts";
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
  /** Let each day have its own hours (tap the times), e.g. a shorter Saturday. */
  editTimes?: boolean;
};

/** Written out in full so Tailwind picks them up. */
const EDITED_TEXT = {
  fast: "text-fast-ink font-medium",
  production: "text-production-ink font-medium",
} as const;

/** Every day of a batch: tick or untick it; days already logged are shown, not saved. */
function BatchPreview({ schedule, theme, summary, renderExtra, editTimes = false }: Props) {
  const tb = useTranslations("shift.batch");
  const dateLocale = useDateLocale();
  const { days, chosen, clashes, left, edited } = schedule;
  /** The day whose hours are open for editing. */
  const [editing, setEditing] = useState<string | null>(null);

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
          const own = edited.has(day.key);
          const open = editTimes && on && editing === day.key;
          const dayName = format(day.start, "EEEE d MMM", { locale: dateLocale });
          const hours = (
            <>
              {format(day.start, "p", { locale: dateLocale })}–
              {format(day.end, "p", { locale: dateLocale })}
            </>
          );
          return (
            <li key={day.key} className="px-3 py-1.5 text-sm">
              <div className="flex min-h-8 items-center gap-3">
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
                    {format(day.start, "EEE d MMM", { locale: dateLocale })}
                  </span>
                  {editTimes && on ? null : (
                    <span
                      className={cn("tabular-nums", own ? EDITED_TEXT[theme] : "text-ink-muted")}
                    >
                      {hours}
                    </span>
                  )}
                </label>
                {editTimes && on ? (
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-label={tb("edit_hours", { day: dayName })}
                    onClick={() => setEditing(open ? null : day.key)}
                    className={cn(
                      "-mr-1.5 flex items-center gap-1.5 rounded-md px-1.5 py-1 tabular-nums transition-colors hover:bg-surface-sunken",
                      own ? EDITED_TEXT[theme] : "text-ink-muted"
                    )}
                  >
                    {hours}
                    <Pencil className="size-3.5 opacity-70" aria-hidden="true" />
                  </button>
                ) : null}
                {clash ? (
                  <span className="rounded-sm bg-surface-sunken px-1.5 py-0.5 text-xs text-ink-muted">
                    {tb("overlap")}
                  </span>
                ) : renderExtra ? (
                  renderExtra(day, on)
                ) : null}
              </div>
              {open ? (
                <DayHours
                  key={day.key}
                  day={day}
                  edited={own}
                  onChange={(start, finish) => schedule.setDayTimes(day.key, start, finish)}
                  onReset={() => schedule.resetDayTimes(day.key)}
                  onDone={() => setEditing(null)}
                />
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

/** Start and finish for one day; a finish before the start ends the next day. */
function DayHours({
  day,
  edited,
  onChange,
  onReset,
  onDone,
}: {
  day: BatchDay;
  edited: boolean;
  onChange: (start: string, finish: string) => void;
  onReset: () => void;
  onDone: () => void;
}) {
  const t = useTranslations("shift.batch");
  const start = format(day.start, "HH:mm");
  const finish = format(day.end, "HH:mm");

  return (
    <div className="mt-1.5 mb-1 flex flex-col gap-2 rounded-md bg-surface-sunken p-2.5">
      <div className="grid grid-cols-2 gap-2">
        <Input
          label={t("day_start")}
          name={`batch-start-${day.key}`}
          type="time"
          variant="outlined"
          value={start}
          onChange={(e) => e.target.value && onChange(e.target.value, finish)}
        />
        <Input
          label={t("day_finish")}
          name={`batch-finish-${day.key}`}
          type="time"
          variant="outlined"
          value={finish}
          onChange={(e) => e.target.value && onChange(start, e.target.value)}
        />
      </div>
      <div className="flex items-center justify-between gap-2 text-xs">
        {edited ? (
          <button
            type="button"
            onClick={onReset}
            className="rounded-md px-1.5 py-1 text-ink-muted underline-offset-2 hover:underline"
          >
            {t("day_reset")}
          </button>
        ) : (
          <span className="text-ink-muted">{t("day_hint")}</span>
        )}
        <button
          type="button"
          onClick={onDone}
          className="rounded-md px-2 py-1 font-semibold text-ink hover:bg-surface"
        >
          {t("day_done")}
        </button>
      </div>
    </div>
  );
}

export default BatchPreview;

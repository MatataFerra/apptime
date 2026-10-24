"use client";

import { useMemo } from "react";

import { addDays, format } from "date-fns";
import { useTranslations } from "next-intl";

import Input from "@/components/ui/Input";

import { MODULE_THEMES, type ModuleTheme } from "@/utils/constants/modules";
import { MAX_BATCH_DAYS, WEEK_ORDER } from "@/utils/helpers/batchShifts";
import { cn } from "@/utils/helpers/styleMerger";
import useDateLocale from "@/hooks/useDateLocale";

import type { BatchSchedule } from "./useBatchSchedule";

/** Any Monday: the chips are labelled from its week. */
const A_MONDAY = new Date(2026, 9, 5);

type Props = {
  schedule: BatchSchedule;
  theme: ModuleTheme;
};

/** First shift, "repeat until" and the days of the week of a batch. */
function BatchScheduleFields({ schedule, theme }: Props) {
  const tb = useTranslations("shift.batch");
  const dateLocale = useDateLocale();
  const colors = MODULE_THEMES[theme];
  const { start, finish, until, weekdays, error } = schedule;
  const thisYear = new Date().getFullYear();

  const weekdayChips = useMemo(
    () =>
      WEEK_ORDER.map((day) => {
        const date = addDays(A_MONDAY, (day + 6) % 7);
        return {
          day,
          short: format(date, "EEEEEE", { locale: dateLocale }),
          long: format(date, "EEEE", { locale: dateLocale }),
        };
      }),
    [dateLocale]
  );

  const finishError = error === "finish_before_start" || error === "too_long";
  const untilError = error === "until_before_start" || error === "range_too_long";

  return (
    <>
      <Input
        containerClasses="flex-1"
        classes="h-full"
        label={tb("first_start")}
        name="batch-start"
        type="datetime-local"
        max={`${thisYear}-12-31T23:59`}
        value={start}
        onChange={(e) => schedule.onStartChange(e.target.value)}
      />
      <Input
        containerClasses="flex-1"
        classes="h-full"
        label={tb("first_finish")}
        name="batch-finish"
        type="datetime-local"
        max={`${thisYear + 1}-01-01T23:59`}
        isError={finishError}
        description={finishError ? tb(`errors.${error}`) : tb("night_hint")}
        value={finish}
        onChange={(e) => schedule.setFinish(e.target.value)}
      />

      <Input
        label={tb("until")}
        name="batch-until"
        type="date"
        min={start.slice(0, 10) || undefined}
        max={`${thisYear}-12-31`}
        isError={untilError}
        description={untilError ? tb(`errors.${error}`, { max: MAX_BATCH_DAYS }) : undefined}
        value={until}
        onChange={(e) => schedule.setUntil(e.target.value)}
      />

      <fieldset className="w-full">
        <legend className="mb-1.5 block text-sm font-medium text-ink">{tb("weekdays")}</legend>
        <div className="grid grid-cols-7 gap-1.5">
          {weekdayChips.map(({ day, short, long }) => {
            const on = weekdays.includes(day);
            return (
              <button
                key={day}
                type="button"
                aria-pressed={on}
                aria-label={long}
                onClick={() => schedule.toggleWeekday(day)}
                className={cn(
                  "h-10 rounded-md border text-sm font-medium capitalize transition-colors",
                  on
                    ? cn("border-transparent", colors.soft, colors.ink)
                    : "border-border text-ink-muted hover:border-border-strong"
                )}
              >
                {short}
              </button>
            );
          })}
        </div>
        {error === "no_weekdays" ? (
          <small className="mt-1 block text-xs text-destructive">{tb("errors.no_weekdays")}</small>
        ) : null}
      </fieldset>
    </>
  );
}

export default BatchScheduleFields;

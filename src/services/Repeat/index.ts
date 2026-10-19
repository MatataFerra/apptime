import { differenceInMinutes, isBefore, startOfDay } from "date-fns";

import type { HourlyType } from "@/types";

export type RepeatPlan = {
  last: HourlyType;
  start: Date;
  end: Date;
};

/**
 * The last Fast charge shift, moved to today with the same start time and
 * length. Only offered from the day after it (a second one the same day
 * is almost always a duplicate).
 */
export function repeatableFastCharge(
  hourly: HourlyType[] | undefined | null,
  now = new Date()
): RepeatPlan | null {
  const last = (hourly ?? [])
    .filter((s) => s.source === "fast" && s.isClosed && s.endDate)
    .sort((a, b) => new Date(a.startDate).valueOf() - new Date(b.startDate).valueOf())
    .at(-1);

  if (!last?.endDate) return null;

  const lastStart = new Date(last.startDate);
  const lastEnd = new Date(last.endDate);
  if (isNaN(lastStart.valueOf()) || isNaN(lastEnd.valueOf())) return null;
  if (!isBefore(lastStart, startOfDay(now))) return null;

  const minutes = differenceInMinutes(lastEnd, lastStart);
  if (minutes <= 0) return null;

  const start = new Date(now);
  start.setHours(lastStart.getHours(), lastStart.getMinutes(), 0, 0);
  const end = new Date(start.valueOf() + minutes * 60_000);

  return { last, start, end };
}

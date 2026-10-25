import { differenceInMinutes, isBefore, startOfDay } from "date-fns";

import type { HourlyType } from "@/types";

export type RepeatPlan = {
  last: HourlyType;
  start: Date;
  end: Date;
};

/**
 * A shift moved to `now`'s day: same start time and length. Null when its
 * dates are unusable.
 */
export function movedToDay(shift: HourlyType, now = new Date()) {
  if (!shift.endDate) return null;
  const lastStart = new Date(shift.startDate);
  const lastEnd = new Date(shift.endDate);
  if (isNaN(lastStart.valueOf()) || isNaN(lastEnd.valueOf())) return null;

  const minutes = differenceInMinutes(lastEnd, lastStart);
  if (minutes <= 0) return null;

  const start = new Date(now);
  start.setHours(lastStart.getHours(), lastStart.getMinutes(), 0, 0);
  const end = new Date(start.valueOf() + minutes * 60_000);
  return { start, end };
}

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

  if (!last) return null;
  if (!isBefore(new Date(last.startDate), startOfDay(now))) return null;

  const moved = movedToDay(last, now);
  return moved ? { last, ...moved } : null;
}

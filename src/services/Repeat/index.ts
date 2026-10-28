import { addDays, differenceInMinutes, endOfDay } from "date-fns";

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

/** Hours after the last shift ends before offering to repeat it (a night's sleep). */
export const REPEAT_OFFER_FROM_HOURS = 8;
/**
 * When the offer to repeat `shift` is shown: from 8h after it ended (a
 * night's sleep) until the end of the day after the one it started on.
 * So a shift worked yesterday is offered all of today, however late it
 * ended, and a night shift (18:00–02:00) is offered the day it ends on.
 */
export function repeatWindow(shift: Pick<HourlyType, "startDate" | "endDate">) {
  if (!shift.endDate) return null;
  const start = new Date(shift.startDate);
  const end = new Date(shift.endDate);
  if (isNaN(start.valueOf()) || isNaN(end.valueOf())) return null;
  return {
    from: new Date(end.valueOf() + REPEAT_OFFER_FROM_HOURS * 3_600_000),
    until: endOfDay(addDays(start, 1)),
  };
}

/**
 * The last Fast charge shift, moved to today with the same start time and
 * length, while its repeatWindow is open: you finish, sleep, and from the
 * moment you're up until the end of the next day the app suggests the same
 * shift again. Outside that window it's either a duplicate or stale.
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

  const window = repeatWindow(last);
  if (!window || now < window.from || now > window.until) return null;

  const moved = movedToDay(last, now);
  return moved ? { last, ...moved } : null;
}

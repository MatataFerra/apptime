import { differenceInMinutes } from "date-fns";

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
/** Hours after the last shift ends when the offer goes away. */
export const REPEAT_OFFER_UNTIL_HOURS = 24;

/**
 * The last Fast charge shift, moved to today with the same start time and
 * length. Only offered between 8h and 24h after that shift ended: you finish,
 * sleep, and from the moment you're up until the next night the app suggests
 * the same shift again. Outside that window it's either a duplicate or stale.
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

  const ended = new Date(last.endDate).valueOf();
  if (isNaN(ended)) return null;
  const elapsedHours = (now.valueOf() - ended) / 3_600_000;
  if (elapsedHours < REPEAT_OFFER_FROM_HOURS || elapsedHours >= REPEAT_OFFER_UNTIL_HOURS) {
    return null;
  }

  const moved = movedToDay(last, now);
  return moved ? { last, ...moved } : null;
}

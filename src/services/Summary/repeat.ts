import { addMinutes, differenceInMinutes, format, set } from "date-fns";

import type { HourlyType } from "@/types";

const DAY_MS = 24 * 60 * 60 * 1000;

export type RepeatPlan = {
  source: HourlyType;
  startDate: string; // yyyy-MM-dd
  startTime: string; // HH:mm
  finishDate: string;
  finishTime: string;
};

/** The most recent closed hourly shift (Fast charge or a finished Track shift). */
export function lastClosedHourly(hourly: HourlyType[] | null | undefined) {
  return (hourly ?? [])
    .filter((s) => s.isClosed && s.startDate && s.endDate)
    .sort((a, b) => new Date(b.startDate).valueOf() - new Date(a.startDate).valueOf())[0];
}

/** A shift moved to `now`'s day: same start time, same length (overnight stays overnight). */
export function moveToToday(source: HourlyType, now = new Date()): RepeatPlan | null {
  const sourceStart = new Date(source.startDate);
  const sourceEnd = new Date(source.endDate as string);
  if (isNaN(sourceStart.valueOf()) || isNaN(sourceEnd.valueOf())) return null;

  const length = differenceInMinutes(sourceEnd, sourceStart);
  if (length <= 0) return null;

  const start = set(now, {
    hours: sourceStart.getHours(),
    minutes: sourceStart.getMinutes(),
    seconds: 0,
    milliseconds: 0,
  });
  const finish = addMinutes(start, length);

  return {
    source,
    startDate: format(start, "yyyy-MM-dd"),
    startTime: format(start, "HH:mm"),
    finishDate: format(finish, "yyyy-MM-dd"),
    finishTime: format(finish, "HH:mm"),
  };
}

/**
 * What Home offers to repeat: the last shift moved to today, once at least
 * 24h have passed since it started and nothing is being tracked right now.
 */
export function planRepeat(
  hourly: HourlyType[] | null | undefined,
  now = new Date()
): RepeatPlan | null {
  if ((hourly ?? []).some((s) => !s.isClosed)) return null;

  const source = lastClosedHourly(hourly);
  if (!source) return null;
  if (now.valueOf() - new Date(source.startDate).valueOf() < DAY_MS) return null;

  return moveToToday(source, now);
}

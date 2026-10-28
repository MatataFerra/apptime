"use client";

import { useMemo, useState } from "react";

import { addDays, format } from "date-fns";

import {
  type BatchDay,
  type BatchError,
  buildBatchDays,
  findOverlaps,
  type Weekday,
  withDayTimes,
} from "@/utils/helpers/batchShifts";
import { defaultFinish, needsDefaultFinish } from "@/utils/helpers/defaultFinish";
import useHourlyShifts from "@/hooks/useHourlyShifts";
import useProductionShifts from "@/hooks/useProductionShifts";

const WORK_WEEK: Weekday[] = [1, 2, 3, 4, 5];

/**
 * The dates of a batch: the first shift, the weekdays and "until", turned into
 * days. Days that run into a saved shift (hourly or production) are flagged,
 * and any other day can be left out.
 */
export function useBatchSchedule() {
  const { data: hourly } = useHourlyShifts();
  const { data: production } = useProductionShifts();

  const [start, setStart] = useState("");
  const [finish, setFinish] = useState("");
  const [until, setUntil] = useState("");
  const [weekdays, setWeekdays] = useState<Weekday[]>(WORK_WEEK);
  /** Hours changed for one day (`HH:mm`), e.g. a shorter Saturday, by day key. */
  const [times, setTimes] = useState<Record<string, { start: string; finish: string }>>({});
  /** Days the user unticked in the preview. */
  const [left, setLeft] = useState<Set<string>>(() => new Set());

  const result = useMemo(
    () => buildBatchDays({ start, finish, until, weekdays }),
    [start, finish, until, weekdays]
  );
  const days = useMemo(
    () =>
      (result.ok ? result.days : []).map((day) => {
        const own = times[day.key];
        return (own && withDayTimes(day, own.start, own.finish)) || day;
      }),
    [result, times]
  );
  /** Days whose hours differ from the first shift's. */
  const edited = useMemo(
    () =>
      new Set(
        result.ok
          ? result.days
              .filter((day) => {
                const own = times[day.key];
                return own && withDayTimes(day, own.start, own.finish);
              })
              .map((day) => day.key)
          : []
      ),
    [result, times]
  );

  const clashes = useMemo(
    () => findOverlaps(days, [...(hourly ?? []), ...(production ?? [])]),
    [days, hourly, production]
  );

  const chosen = useMemo(
    () => days.filter((day) => !clashes.has(day.key) && !left.has(day.key)),
    [days, clashes, left]
  );

  // Only complain about a field once the user has filled the ones it depends on.
  const error: BatchError | null =
    !result.ok && start && finish && (until || result.error !== "invalid_until")
      ? result.error
      : null;

  function onStartChange(value: string) {
    setStart(value);
    // A shift rarely spans days: suggest a finish 8h later, same day.
    if (value && needsDefaultFinish(value, finish)) setFinish(defaultFinish(value));
    // A week ahead is the usual stretch; never before the first day.
    const day = value.slice(0, 10);
    if (day && (!until || until < day)) {
      setUntil(format(addDays(new Date(`${day}T00:00`), 6), "yyyy-MM-dd"));
    }
  }

  function toggleWeekday(day: Weekday) {
    setWeekdays((current) =>
      current.includes(day) ? current.filter((d) => d !== day) : [...current, day]
    );
  }

  function toggleDay(key: string) {
    setLeft((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  /** Other hours for one day; finishing at or before the start means the next day. */
  function setDayTimes(key: string, start: string, finish: string) {
    setTimes((current) => ({ ...current, [key]: { start, finish } }));
  }

  /** Back to the first shift's hours. */
  function resetDayTimes(key: string) {
    setTimes((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function reset() {
    setTimes({});
    setStart("");
    setFinish("");
    setUntil("");
    setWeekdays(WORK_WEEK);
    setLeft(new Set());
  }

  return {
    start,
    finish,
    until,
    weekdays,
    days,
    clashes,
    chosen,
    error,
    left,
    edited,
    onStartChange,
    setFinish,
    setUntil,
    toggleWeekday,
    toggleDay,
    setDayTimes,
    resetDayTimes,
    reset,
  };
}

export type BatchSchedule = ReturnType<typeof useBatchSchedule>;

/** The chosen days as the server actions take them. */
export function toShiftDates(days: BatchDay[]) {
  return days.map((day) => ({
    startDate: day.start.toString(),
    endDate: day.end.toString(),
  }));
}

/** A typed number, or 0 when empty, negative or not a number. */
export function toNumber(value: string) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

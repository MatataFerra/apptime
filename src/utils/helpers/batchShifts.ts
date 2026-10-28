import { addDays, differenceInCalendarDays, differenceInMinutes, format, isValid } from "date-fns";

/** Longest batch, in calendar days from the first shift to "until" (two months). */
export const MAX_BATCH_DAYS = 62;

/** A shift can't run longer than a day. */
export const MAX_SHIFT_MINUTES = 24 * 60;

/** 0 Sunday … 6 Saturday, as `Date.getDay()`. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Monday first, as the week reads in the form. */
export const WEEK_ORDER: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

export type BatchPattern = {
  /** First shift's start, `yyyy-MM-dd'T'HH:mm` (datetime-local). */
  start: string;
  /** First shift's finish, same format: same day, or the next one for a night shift. */
  finish: string;
  /** Last day a shift may start on, `yyyy-MM-dd`. */
  until: string;
  weekdays: Weekday[];
};

export type BatchDay = {
  /** `yyyy-MM-dd` of the start, unique within a batch. */
  key: string;
  start: Date;
  end: Date;
};

export type BatchError =
  | "invalid_start"
  | "invalid_finish"
  | "finish_before_start"
  | "too_long"
  | "invalid_until"
  | "until_before_start"
  | "range_too_long"
  | "no_weekdays";

export type BatchResult = { ok: true; days: BatchDay[] } | { ok: false; error: BatchError };

/** Local wall-clock date + time, so DST changes keep the hours the user typed. */
function atTime(day: Date, hours: number, minutes: number) {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes, 0, 0);
}

/** `yyyy-MM-dd` (or the date part of a datetime-local) at local midnight. */
function localDay(value: string) {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return new Date(NaN);
  const date = new Date(y, m - 1, d);
  // new Date(2026, 1, 31) rolls over to March: not a real date.
  return date.getMonth() === m - 1 ? date : new Date(NaN);
}

/**
 * The shifts a pattern repeats into: every chosen weekday from the first
 * shift's day to `until`, all with the first shift's hours. A finish on the
 * next day (night shift) keeps finishing on the next day.
 */
export function buildBatchDays({ start, finish, until, weekdays }: BatchPattern): BatchResult {
  const first = new Date(start);
  const firstEnd = new Date(finish);
  if (!start || !isValid(first)) return { ok: false, error: "invalid_start" };
  if (!finish || !isValid(firstEnd)) return { ok: false, error: "invalid_finish" };

  const minutes = differenceInMinutes(firstEnd, first);
  if (minutes <= 0) return { ok: false, error: "finish_before_start" };
  if (minutes > MAX_SHIFT_MINUTES) return { ok: false, error: "too_long" };

  const firstDay = localDay(start);
  const lastDay = localDay(until);
  if (!until || !isValid(lastDay)) return { ok: false, error: "invalid_until" };

  const span = differenceInCalendarDays(lastDay, firstDay);
  if (span < 0) return { ok: false, error: "until_before_start" };
  if (span + 1 > MAX_BATCH_DAYS) return { ok: false, error: "range_too_long" };

  const chosen = new Set(weekdays);
  if (chosen.size === 0) return { ok: false, error: "no_weekdays" };

  const endOffset = differenceInCalendarDays(firstEnd, first);
  const [sh, sm] = [first.getHours(), first.getMinutes()];
  const [eh, em] = [firstEnd.getHours(), firstEnd.getMinutes()];

  const days: BatchDay[] = [];
  for (let i = 0; i <= span; i++) {
    const day = addDays(firstDay, i);
    if (!chosen.has(day.getDay() as Weekday)) continue;

    days.push({
      key: format(day, "yyyy-MM-dd"),
      start: atTime(day, sh, sm),
      end: atTime(addDays(day, endOffset), eh, em),
    });
  }

  return { ok: true, days };
}

/** `HH:mm` → [hours, minutes], or null when it isn't a time. */
function parseTime(value: string): [number, number] | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [h, m] = [Number(match[1]), Number(match[2])];
  return h < 24 && m < 60 ? [h, m] : null;
}

/**
 * The same batch day with other hours (`HH:mm`), e.g. a shorter Saturday.
 * A finish at or before the start ends the next day (night shift). Null when
 * a time is invalid or both are the same.
 */
export function withDayTimes(day: BatchDay, start: string, finish: string): BatchDay | null {
  const s = parseTime(start);
  const f = parseTime(finish);
  if (!s || !f || (s[0] === f[0] && s[1] === f[1])) return null;

  const date = localDay(day.key);
  if (!isValid(date)) return null;
  const startAt = atTime(date, s[0], s[1]);
  const sameDay = f[0] * 60 + f[1] > s[0] * 60 + s[1];
  const endAt = atTime(sameDay ? date : addDays(date, 1), f[0], f[1]);
  return { key: day.key, start: startAt, end: endAt };
}

type Span = { startDate: string | Date; endDate?: string | Date | null };

function toRange(span: Span, now: Date) {
  const start = new Date(span.startDate);
  // A shift still running (Track) takes up time until now.
  const end = span.endDate ? new Date(span.endDate) : now > start ? now : start;
  return { start, end };
}

/** True when two shifts share any minute (touching ends don't count). */
export function overlaps(a: Span, b: Span, now = new Date()) {
  const x = toRange(a, now);
  const y = toRange(b, now);
  if (!isValid(x.start) || !isValid(y.start) || !isValid(x.end) || !isValid(y.end)) return false;
  return x.start < y.end && y.start < x.end;
}

/** The first saved shift that `span` runs into, if any. */
export function findClash<T extends Span>(span: Span, existing: T[], now = new Date()) {
  return existing.find((shift) => overlaps(span, shift, now));
}

/** Keys of the batch days that run into a shift already saved. */
export function findOverlaps(days: BatchDay[], existing: Span[], now = new Date()) {
  const clash = new Set<string>();
  for (const day of days) {
    const span = { startDate: day.start, endDate: day.end };
    if (existing.some((shift) => overlaps(span, shift, now))) clash.add(day.key);
  }
  return clash;
}

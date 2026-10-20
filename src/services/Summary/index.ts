import {
  addDays,
  differenceInMinutes,
  endOfMonth,
  endOfWeek,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";

import ShiftService from "@/services/Shift";

import type { HourlyType, ProductionType } from "@/types";

type AnyShift = HourlyType | ProductionType;

export type DaySummary = {
  date: Date;
  hourly: number;
  production: number;
  publicHoliday: boolean;
};

export type PeriodSummary = {
  from: Date;
  to: Date;
  earned: number;
  minutes: number;
  shifts: number;
};

export type WeekSummary = PeriodSummary & { days: DaySummary[] };

const WEEK_STARTS_ON = { sunday: 0, monday: 1 } as const;

export function weekStartsOnIndex(value?: string | null): 0 | 1 {
  return WEEK_STARTS_ON[(value ?? "").toLowerCase() as keyof typeof WEEK_STARTS_ON] ?? 1;
}

function shiftDate(shift: AnyShift) {
  return new Date(shift.startDate);
}

/** Worked minutes of a closed shift; falls back to start/end when `amount` is missing. */
export function shiftMinutes(shift: AnyShift) {
  if (typeof shift.amount === "number" && shift.amount > 0) return shift.amount;
  if (!shift.endDate) return 0;
  const diff = differenceInMinutes(new Date(shift.endDate), new Date(shift.startDate));
  return diff > 0 ? diff : 0;
}

export function shiftEarnings(shift: AnyShift) {
  const value = new ShiftService(shift).calculateEarnings();
  return Number.isFinite(value) ? value : 0;
}

function closedIn<T extends AnyShift>(shifts: T[] | undefined | null, from: Date, to: Date) {
  return (shifts ?? []).filter((shift) => {
    const date = shiftDate(shift);
    return (
      shift.isClosed && !isNaN(date.valueOf()) && isWithinInterval(date, { start: from, end: to })
    );
  });
}

export function summarizePeriod(
  hourly: HourlyType[] | undefined | null,
  production: ProductionType[] | undefined | null,
  from: Date,
  to: Date
): PeriodSummary {
  const shifts: AnyShift[] = [...closedIn(hourly, from, to), ...closedIn(production, from, to)];

  return shifts.reduce<PeriodSummary>(
    (acc, shift) => ({
      ...acc,
      earned: acc.earned + shiftEarnings(shift),
      minutes: acc.minutes + shiftMinutes(shift),
      shifts: acc.shifts + 1,
    }),
    { from, to, earned: 0, minutes: 0, shifts: 0 }
  );
}

/** The week containing `now`, with one entry per day split by shift type. */
export function summarizeWeek(
  hourly: HourlyType[] | undefined | null,
  production: ProductionType[] | undefined | null,
  { now = new Date(), weekStartsOn = 1 as 0 | 1 } = {}
): WeekSummary {
  const from = startOfWeek(now, { weekStartsOn });
  const to = endOfWeek(now, { weekStartsOn });
  const period = summarizePeriod(hourly, production, from, to);

  const days: DaySummary[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(from, i);
    const dayStart = startOfDay(date);
    const dayEnd = addDays(dayStart, 1);
    const dayLast = new Date(dayEnd.valueOf() - 1);
    const h = closedIn(hourly, dayStart, dayLast);
    const p = closedIn(production, dayStart, dayLast);

    return {
      date,
      hourly: h.reduce((acc, s) => acc + shiftEarnings(s), 0),
      production: p.reduce((acc, s) => acc + shiftEarnings(s), 0),
      publicHoliday: [...h, ...p].some((s) => s.isPublicHoliday),
    };
  });

  return { ...period, days };
}

export type MonthComparison = {
  current: PeriodSummary;
  /** Previous month, 1st up to today's day number. */
  previous: PeriodSummary;
  /** The whole previous month. */
  previousFull: PeriodSummary;
  /** Percent change vs the same days of the previous month; null when those days earned nothing. */
  change: number | null;
  /** This month so far as a percent of the whole previous month; null when it earned nothing. */
  shareOfPrevious: number | null;
};

/**
 * This month so far against the same stretch of last month
 * (1st to today's day number), so a month in progress isn't compared
 * with a full one.
 */
export function compareWithPreviousMonth(
  hourly: HourlyType[] | undefined | null,
  production: ProductionType[] | undefined | null,
  now = new Date()
): MonthComparison {
  const current = summarizePeriod(hourly, production, startOfMonth(now), now);

  const prevStart = startOfMonth(subMonths(now, 1));
  const prevMonthEnd = endOfMonth(prevStart);
  const sameDay = addDays(prevStart, now.getDate() - 1);
  const prevEnd = new Date(
    Math.min(
      prevMonthEnd.valueOf(),
      sameDay.valueOf() + (now.valueOf() - startOfDay(now).valueOf())
    )
  );
  const previous = summarizePeriod(hourly, production, prevStart, prevEnd);
  const previousFull = summarizePeriod(hourly, production, prevStart, prevMonthEnd);

  const change =
    previous.earned > 0
      ? Math.round(((current.earned - previous.earned) / previous.earned) * 100)
      : null;
  const shareOfPrevious =
    previousFull.earned > 0 ? Math.round((current.earned / previousFull.earned) * 100) : null;

  return { current, previous, previousFull, change, shareOfPrevious };
}

/**
 * Typical length of a tracked hourly shift: the median of the last
 * `sample` closed shifts that have a duration. Null with fewer than 3.
 */
export function usualShiftMinutes(hourly: HourlyType[] | undefined | null, sample = 10) {
  const durations = (hourly ?? [])
    .filter((s) => s.isClosed)
    .sort((a, b) => shiftDate(a).valueOf() - shiftDate(b).valueOf())
    .slice(-sample)
    .map(shiftMinutes)
    .filter((m) => m > 0)
    .sort((a, b) => a - b);

  if (durations.length < 3) return null;

  const mid = Math.floor(durations.length / 2);
  return durations.length % 2
    ? durations[mid]
    : Math.round((durations[mid - 1] + durations[mid]) / 2);
}

/** Earnings of an open hourly shift up to `now`, with its own rate and breaks. */
export function runningShiftEarnings(
  shift: Partial<HourlyType> | null | undefined,
  now = new Date()
) {
  if (!shift?.startDate || !shift.hourValue) return 0;
  return ShiftService.calculateEarnings({
    hourValue: shift.hourValue,
    startDate: shift.startDate,
    endDate: now.toString(),
    unpaidBreaks: shift.unpaidBreaks ?? 0,
    isPublicHoliday: shift.isPublicHoliday ?? false,
  });
}

/**
 * Money in a given ISO 4217 currency. With cents, the currency's own
 * minor units apply (USD 2, JPY 0); `cents: false` rounds to whole units.
 */
export function formatMoney(value: number, { cents = true, currency = "USD" } = {}) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    ...(cents ? {} : { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
  }).format(value);
}

/** Short axis labels: $1.4K, €900. */
export function formatMoneyCompact(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatHours(minutes: number) {
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`;
}

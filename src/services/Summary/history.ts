import { addWeeks, format, startOfMonth, startOfWeek, subMonths, subWeeks } from "date-fns";

import { shiftEarnings } from "@/services/Summary";

import type { HourlyType, ProductionType } from "@/types";

export type AnyShift = HourlyType | ProductionType;

/** Per-piece (Production) shifts have an item value; hourly ones an hour value. */
export function isPieceShift(shift: AnyShift): shift is ProductionType {
  return "itemValue" in shift && !("hourValue" in shift);
}

function closed<T extends AnyShift>(shifts: T[] | null | undefined) {
  return (shifts ?? []).filter((s) => s.isClosed && !isNaN(new Date(s.startDate).valueOf()));
}

export type MonthGroup = {
  key: string; // yyyy-MM
  label: string; // October 2026
  total: number;
  shifts: AnyShift[];
};

/** Closed shifts, newest first, grouped by the month they started in. */
export function groupByMonth(shifts: AnyShift[]): MonthGroup[] {
  const sorted = closed(shifts).sort(
    (a, b) => new Date(b.startDate).valueOf() - new Date(a.startDate).valueOf()
  );
  const groups = new Map<string, MonthGroup>();

  for (const shift of sorted) {
    const date = new Date(shift.startDate);
    const key = format(date, "yyyy-MM");
    const group = groups.get(key) ?? {
      key,
      label: format(date, "MMMM yyyy"),
      total: 0,
      shifts: [],
    };
    group.total += shiftEarnings(shift);
    group.shifts.push(shift);
    groups.set(key, group);
  }

  return [...groups.values()];
}

export type SeriesPoint = { label: string; hourly: number; production: number };

function sumInto<T extends AnyShift>(
  shifts: T[],
  bucketOf: (date: Date) => string,
  buckets: Map<string, SeriesPoint>,
  key: "hourly" | "production"
) {
  for (const shift of shifts) {
    const point = buckets.get(bucketOf(new Date(shift.startDate)));
    if (point) point[key] += shiftEarnings(shift);
  }
}

function round(points: SeriesPoint[]) {
  return points.map((p) => ({
    ...p,
    hourly: Math.round(p.hourly * 100) / 100,
    production: Math.round(p.production * 100) / 100,
  }));
}

/** Earnings per week for the last `weeks` weeks (oldest first), split by type. */
export function weeklyEarnings(
  hourly: HourlyType[] | null | undefined,
  production: ProductionType[] | null | undefined,
  { weeks = 12, now = new Date(), weekStartsOn = 1 as 0 | 1 } = {}
): SeriesPoint[] {
  const first = startOfWeek(subWeeks(now, weeks - 1), { weekStartsOn });
  const buckets = new Map<string, SeriesPoint>();
  for (let i = 0; i < weeks; i++) {
    const start = addWeeks(first, i);
    buckets.set(format(start, "yyyy-MM-dd"), {
      label: format(start, "d MMM"),
      hourly: 0,
      production: 0,
    });
  }
  const bucketOf = (d: Date) => format(startOfWeek(d, { weekStartsOn }), "yyyy-MM-dd");
  sumInto(closed(hourly), bucketOf, buckets, "hourly");
  sumInto(closed(production), bucketOf, buckets, "production");
  return round([...buckets.values()]);
}

/** Earnings per calendar month for the last `months` months (oldest first), split by type. */
export function monthlyEarnings(
  hourly: HourlyType[] | null | undefined,
  production: ProductionType[] | null | undefined,
  { months = 6, now = new Date() } = {}
): SeriesPoint[] {
  const buckets = new Map<string, SeriesPoint>();
  for (let i = months - 1; i >= 0; i--) {
    const start = startOfMonth(subMonths(now, i));
    buckets.set(format(start, "yyyy-MM"), {
      label: format(start, "MMM"),
      hourly: 0,
      production: 0,
    });
  }
  const bucketOf = (d: Date) => format(d, "yyyy-MM");
  sumInto(closed(hourly), bucketOf, buckets, "hourly");
  sumInto(closed(production), bucketOf, buckets, "production");
  return round([...buckets.values()]);
}

/** Share of all closed-shift earnings that came from each type, in percent. */
export function earningsSplit(
  hourly: HourlyType[] | null | undefined,
  production: ProductionType[] | null | undefined
) {
  const h = closed(hourly).reduce((acc, s) => acc + shiftEarnings(s), 0);
  const p = closed(production).reduce((acc, s) => acc + shiftEarnings(s), 0);
  const total = h + p;
  if (!total) return { hourly: 0, production: 0, total: 0, hourlyShare: 0, productionShare: 0 };
  const hourlyShare = Math.round((h / total) * 100);
  return { hourly: h, production: p, total, hourlyShare, productionShare: 100 - hourlyShare };
}

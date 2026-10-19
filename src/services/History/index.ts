import {
  addWeeks,
  format,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import Pay from "@/services/Pay";
import { shiftEarnings, shiftMinutes } from "@/services/Summary";

import type { HourlyType, ProductionType } from "@/types";

export type ShiftKind = "hourly" | "production";

export type HistoryEntry = {
  id: number;
  kind: ShiftKind;
  shift: HourlyType | ProductionType;
  date: Date;
  name: string | null;
  minutes: number;
  earned: number;
  afterTaxes: number;
  /** "worked" (1.5×), "off" (paid day off) or null for a regular day. */
  holiday: "worked" | "off" | null;
};

export type MonthGroup = { key: string; label: string; earned: number; entries: HistoryEntry[] };

function toEntry(shift: HourlyType | ProductionType, kind: ShiftKind): HistoryEntry | null {
  const date = new Date(shift.startDate);
  if (!shift.isClosed || isNaN(date.valueOf())) return null;
  const earned = shiftEarnings(shift);

  return {
    id: shift.id,
    kind,
    shift,
    date,
    name: shift.name,
    minutes: shiftMinutes(shift),
    earned,
    afterTaxes: Pay.afterTax(earned, shift.taxes ?? []),
    holiday: shift.publicHolidayWorked ? "worked" : shift.isPublicHoliday ? "off" : null,
  };
}

/** Closed shifts of both kinds, newest first. */
export function historyEntries(
  hourly: HourlyType[] | undefined | null,
  production: ProductionType[] | undefined | null
) {
  return [
    ...(hourly ?? []).map((s) => toEntry(s, "hourly")),
    ...(production ?? []).map((s) => toEntry(s, "production")),
  ]
    .filter((e): e is HistoryEntry => e !== null)
    .sort((a, b) => b.date.valueOf() - a.date.valueOf());
}

/** Entries grouped by calendar month (newest first), with each month's total. */
export function groupByMonth(entries: HistoryEntry[]): MonthGroup[] {
  const groups = new Map<string, MonthGroup>();
  for (const entry of entries) {
    const key = format(entry.date, "yyyy-MM");
    const group = groups.get(key) ?? {
      key,
      label: format(startOfMonth(entry.date), "MMMM yyyy"),
      earned: 0,
      entries: [],
    };
    group.earned += entry.earned;
    group.entries.push(entry);
    groups.set(key, group);
  }
  return [...groups.values()];
}

export type WeekPoint = { label: string; start: Date; hourly: number; production: number };

/** Earnings per week for the last `weeks` weeks (oldest first), split by kind. */
export function weeklyEarnings(
  entries: HistoryEntry[],
  { weeks = 12, now = new Date(), weekStartsOn = 1 as 0 | 1 } = {}
): WeekPoint[] {
  const thisWeek = startOfWeek(now, { weekStartsOn });

  return Array.from({ length: weeks }, (_, i) => {
    const start = addWeeks(thisWeek, i - weeks + 1);
    const end = new Date(addWeeks(start, 1).valueOf() - 1);
    const inWeek = entries.filter((e) => isWithinInterval(e.date, { start, end }));
    const sum = (kind: ShiftKind) =>
      round(inWeek.filter((e) => e.kind === kind).reduce((acc, e) => acc + e.earned, 0));

    return {
      label: format(start, "d MMM"),
      start,
      hourly: sum("hourly"),
      production: sum("production"),
    };
  });
}

export type CumulativePoint = { label: string; date: Date; hourly: number; production: number };

/** Running totals per kind, one point per day with shifts (oldest first). */
export function cumulativeEarnings(entries: HistoryEntry[]): CumulativePoint[] {
  const byDay = new Map<number, { hourly: number; production: number }>();
  for (const e of entries) {
    const day = startOfDay(e.date).valueOf();
    const totals = byDay.get(day) ?? { hourly: 0, production: 0 };
    totals[e.kind] += e.earned;
    byDay.set(day, totals);
  }

  let hourly = 0;
  let production = 0;
  return [...byDay.entries()]
    .sort(([a], [b]) => a - b)
    .map(([day, totals]) => {
      hourly += totals.hourly;
      production += totals.production;
      const date = new Date(day);
      return {
        label: format(date, "d MMM"),
        date,
        hourly: round(hourly),
        production: round(production),
      };
    });
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

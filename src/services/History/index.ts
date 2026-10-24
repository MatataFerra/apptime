import {
  addWeeks,
  format,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { Locale as DateLocale } from "date-fns/locale";

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
  /** The shift's own currency; null means the user's default. */
  currency: string | null;
  /** Who the shift was for; null when not set. */
  employerId: number | null;
};

/** "all", only the shifts without an employer ("none"), or one employer's id. */
export type EmployerFilter = "all" | "none" | number;

/** Entries of one kind and/or one employer. */
export function filterEntries(
  entries: HistoryEntry[],
  { kind = "all", employer = "all" }: { kind?: "all" | ShiftKind; employer?: EmployerFilter }
) {
  return entries.filter(
    (entry) =>
      (kind === "all" || entry.kind === kind) &&
      (employer === "all" ||
        (employer === "none" ? entry.employerId === null : entry.employerId === employer))
  );
}

/** The employers that appear in `entries`, in no particular order. */
export function employersIn(entries: HistoryEntry[]) {
  return [
    ...new Set(entries.map((e) => e.employerId).filter((id): id is number => id !== null)),
  ];
}

export type MonthGroup = {
  key: string;
  label: string;
  /** Total per currency, the default currency first. Amounts are never added across currencies. */
  totals: { currency: string; amount: number }[];
  entries: HistoryEntry[];
};

/** Whether an entry is in `currency`, counting shifts without one as the default. */
export function inCurrency(
  entry: Pick<HistoryEntry, "currency">,
  currency: string,
  fallback: string
) {
  return (entry.currency ?? fallback) === currency;
}

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
    currency: shift.currency ?? null,
    employerId: shift.employerId ?? null,
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

/**
 * Entries grouped by calendar month (newest first), with each month's
 * total per currency. `fallback` is the currency of shifts saved without one.
 */
export function groupByMonth(
  entries: HistoryEntry[],
  fallback = "USD",
  locale?: DateLocale
): MonthGroup[] {
  const groups = new Map<
    string,
    { label: string; sums: Map<string, number>; entries: HistoryEntry[] }
  >();
  for (const entry of entries) {
    const key = format(entry.date, "yyyy-MM");
    const group = groups.get(key) ?? {
      label: format(startOfMonth(entry.date), "LLLL yyyy", { locale }),
      sums: new Map<string, number>(),
      entries: [],
    };
    const currency = entry.currency ?? fallback;
    group.sums.set(currency, (group.sums.get(currency) ?? 0) + entry.earned);
    group.entries.push(entry);
    groups.set(key, group);
  }
  return [...groups.entries()].map(([key, g]) => ({
    key,
    label: g.label,
    entries: g.entries,
    totals: [...g.sums.entries()]
      .map(([currency, amount]) => ({ currency, amount: round(amount) }))
      .sort((a, b) => Number(b.currency === fallback) - Number(a.currency === fallback)),
  }));
}

/** Days a month shows before "Show more", and how many each tap adds. */
export const DAYS_PER_PAGE = 7;

/**
 * The entries of the `days` most recent days that have shifts (entries come
 * newest first), so a day with several shifts is never cut in half.
 */
export function entriesForDays(entries: HistoryEntry[], days: number) {
  const seen = new Set<string>();
  const visible: HistoryEntry[] = [];
  for (const entry of entries) {
    const day = format(entry.date, "yyyy-MM-dd");
    if (!seen.has(day)) {
      if (seen.size === days) break;
      seen.add(day);
    }
    visible.push(entry);
  }
  return visible;
}

/** How many distinct days have shifts. */
export function countDays(entries: HistoryEntry[]) {
  return new Set(entries.map((entry) => format(entry.date, "yyyy-MM-dd"))).size;
}

export type WeekPoint = { label: string; start: Date; hourly: number; production: number };

/** Earnings per week for the last `weeks` weeks (oldest first), split by kind. */
export function weeklyEarnings(
  entries: HistoryEntry[],
  {
    weeks = 12,
    now = new Date(),
    weekStartsOn = 1 as 0 | 1,
    locale,
  }: { weeks?: number; now?: Date; weekStartsOn?: 0 | 1; locale?: DateLocale } = {}
): WeekPoint[] {
  const thisWeek = startOfWeek(now, { weekStartsOn });

  return Array.from({ length: weeks }, (_, i) => {
    const start = addWeeks(thisWeek, i - weeks + 1);
    const end = new Date(addWeeks(start, 1).valueOf() - 1);
    const inWeek = entries.filter((e) => isWithinInterval(e.date, { start, end }));
    function sum(kind: ShiftKind) {
      return round(inWeek.filter((e) => e.kind === kind).reduce((acc, e) => acc + e.earned, 0));
    }

    return {
      label: format(start, "d MMM", { locale }),
      start,
      hourly: sum("hourly"),
      production: sum("production"),
    };
  });
}

export type CumulativePoint = { label: string; date: Date; hourly: number; production: number };

/** Running totals per kind, one point per day with shifts (oldest first). */
export function cumulativeEarnings(
  entries: HistoryEntry[],
  locale?: DateLocale
): CumulativePoint[] {
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
        label: format(date, "d MMM", { locale }),
        date,
        hourly: round(hourly),
        production: round(production),
      };
    });
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

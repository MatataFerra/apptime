import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfDay,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  max as maxDate,
  min as minDate,
  startOfDay,
  startOfWeek,
} from "date-fns";

import type { HistoryEntry } from "@/services/History";

import { visaCountryOf } from "./country";
import { type CountingRule, GAP_MIN_DAYS, type VisaProgram } from "./programs";

export * from "./country";
export * from "./programs";

/** What the report needs to know about an employer. */
export type ReportEmployer = { id: number; name: string; country: string | null };

/**
 * - confirmed: the shift's employer is in the program's country.
 * - assumed: the shift has no employer, or its employer has no country; it's
 *   inside the period, so it's taken as part of the same work (shown in red
 *   until the user sets the employer).
 */
export type EntryStatus = "confirmed" | "assumed";

/** Why a shift is assumed. */
export type AssumedReason = "no_employer" | "no_country";

export type ReportShift = {
  entry: HistoryEntry;
  status: EntryStatus;
  reason: AssumedReason | null;
};

export type ReportDay = {
  /** Start of the day. */
  date: Date;
  /** yyyy-MM-dd */
  key: string;
  /** Minutes worked that day (0 for a day counted by a full-time week). */
  minutes: number;
  /** "assumed" when nothing confirmed backs the day. */
  status: EntryStatus;
  /** Counted because its week was full-time, not because a shift was logged. */
  filled: boolean;
  shifts: ReportShift[];
};

/** Days in a row without work, inside the period. */
export type ReportGap = { from: Date; to: Date; days: number };

/** One employer's part of the report; `employerId` null for the shifts without one. */
export type ReportEmployerBlock = {
  employerId: number | null;
  status: EntryStatus;
  reason: AssumedReason | null;
  /** Calendar days with at least one of its shifts. */
  days: number;
  minutes: number;
  shifts: number;
  first: Date;
  last: Date;
};

export type VisaReport = {
  program: VisaProgram;
  rule: CountingRule;
  from: Date;
  to: Date;
  /** Every counted day, oldest first. */
  days: ReportDay[];
  /** Counted days backed by a confirmed shift (or a full-time week of them). */
  confirmedDays: number;
  /** Counted days that rest on assumed shifts only. */
  assumedDays: number;
  totalDays: number;
  /** Days still missing to reach the target (0 once reached). */
  remainingDays: number;
  /** Minutes of every shift in the report. */
  minutes: number;
  gaps: ReportGap[];
  employers: ReportEmployerBlock[];
  /** Shifts in the period left out because their employer is in another country. */
  excludedShifts: number;
};

type Options = {
  program: VisaProgram;
  rule?: CountingRule;
  from: Date;
  to: Date;
  /** Day the week starts on, for full-time weeks (0 Sunday, 1 Monday). */
  weekStartsOn?: 0 | 1;
  /** Days without work in a row from which a gap is listed. */
  gapMinDays?: number;
};

function dayKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

/** Which shifts of the period go in the report, and how sure each one is. */
export function classifyEntries(
  entries: HistoryEntry[],
  employers: Map<number, ReportEmployer>,
  { program, from, to }: Pick<Options, "program" | "from" | "to">
) {
  const start = startOfDay(from);
  const end = endOfDay(to);
  const shifts: ReportShift[] = [];
  let excluded = 0;

  for (const entry of entries) {
    if (isBefore(entry.date, start) || isAfter(entry.date, end)) continue;

    const employer = entry.employerId === null ? undefined : employers.get(entry.employerId);
    // An id whose employer is gone is the same as no employer.
    if (!employer) {
      shifts.push({ entry, status: "assumed", reason: "no_employer" });
      continue;
    }

    const country = visaCountryOf(employer.country);
    if (country === null) shifts.push({ entry, status: "assumed", reason: "no_country" });
    else if (country === program.country) shifts.push({ entry, status: "confirmed", reason: null });
    else excluded += 1;
  }

  return { shifts, excluded };
}

/** Days of the shifts, merged per calendar day. */
function workedDays(shifts: ReportShift[]) {
  const days = new Map<string, ReportDay>();
  for (const shift of shifts) {
    const date = startOfDay(shift.entry.date);
    const key = dayKey(date);
    const day = days.get(key) ?? {
      date,
      key,
      minutes: 0,
      status: "assumed" as EntryStatus,
      filled: false,
      shifts: [],
    };
    day.minutes += shift.entry.minutes;
    day.shifts.push(shift);
    if (shift.status === "confirmed") day.status = "confirmed";
    days.set(key, day);
  }
  return days;
}

/**
 * Full-time weeks: a week (inside the period) with `hours` or more counts its
 * 7 days. The added days are confirmed when the confirmed hours alone reach
 * the mark, assumed otherwise.
 */
function fillFullTimeWeeks(
  days: Map<string, ReportDay>,
  { from, to, hours, weekStartsOn }: { from: Date; to: Date; hours: number; weekStartsOn: 0 | 1 }
) {
  const weeks = new Map<string, { start: Date; total: number; confirmed: number }>();
  for (const day of days.values()) {
    const start = startOfWeek(day.date, { weekStartsOn });
    const key = dayKey(start);
    const week = weeks.get(key) ?? { start, total: 0, confirmed: 0 };
    for (const shift of day.shifts) {
      week.total += shift.entry.minutes;
      if (shift.status === "confirmed") week.confirmed += shift.entry.minutes;
    }
    weeks.set(key, week);
  }

  for (const week of weeks.values()) {
    if (week.total < hours * 60) continue;
    const status: EntryStatus = week.confirmed >= hours * 60 ? "confirmed" : "assumed";
    const span = eachDayOfInterval({
      start: maxDate([week.start, startOfDay(from)]),
      end: minDate([endOfWeek(week.start, { weekStartsOn }), endOfDay(to)]),
    });
    for (const date of span) {
      const key = dayKey(date);
      const day = days.get(key);
      if (!day) {
        days.set(key, { date, key, minutes: 0, status, filled: true, shifts: [] });
      } else if (status === "confirmed") {
        day.status = "confirmed";
      }
    }
  }
}

/** Breaks between counted days longer than `minDays`. */
export function findGaps(days: Pick<ReportDay, "date">[], minDays = GAP_MIN_DAYS): ReportGap[] {
  const sorted = [...days].sort((a, b) => a.date.valueOf() - b.date.valueOf());
  const gaps: ReportGap[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const between = differenceInCalendarDays(sorted[i].date, sorted[i - 1].date) - 1;
    if (between >= minDays) {
      gaps.push({
        from: addDays(sorted[i - 1].date, 1),
        to: addDays(sorted[i].date, -1),
        days: between,
      });
    }
  }
  return gaps;
}

/** Days, hours and dates per employer; the shifts without one together. */
function byEmployer(shifts: ReportShift[]): ReportEmployerBlock[] {
  const blocks = new Map<string, ReportEmployerBlock & { dayKeys: Set<string> }>();
  for (const shift of shifts) {
    const { entry } = shift;
    const id = shift.reason === "no_employer" ? null : entry.employerId;
    const key = String(id);
    const block = blocks.get(key) ?? {
      employerId: id,
      status: shift.status,
      reason: shift.reason,
      days: 0,
      minutes: 0,
      shifts: 0,
      first: entry.date,
      last: entry.date,
      dayKeys: new Set<string>(),
    };
    block.minutes += entry.minutes;
    block.shifts += 1;
    block.dayKeys.add(dayKey(entry.date));
    if (isBefore(entry.date, block.first)) block.first = entry.date;
    if (isAfter(entry.date, block.last)) block.last = entry.date;
    blocks.set(key, block);
  }

  return [...blocks.values()]
    .map(({ dayKeys, ...block }) => ({ ...block, days: dayKeys.size }))
    .sort(
      (a, b) =>
        // Confirmed first, then by when the work started.
        Number(a.status === "assumed") - Number(b.status === "assumed") ||
        a.first.valueOf() - b.first.valueOf()
    );
}

/**
 * The work done in the program's country between `from` and `to`, counted
 * the way the extension asks for it. Shifts without an employer (or whose
 * employer has no country) inside the period count as assumed; shifts for
 * employers in other countries are left out.
 */
export function visaReport(
  entries: HistoryEntry[],
  employers: Map<number, ReportEmployer>,
  {
    program,
    rule = program.rules[0],
    from,
    to,
    weekStartsOn = 1,
    gapMinDays = GAP_MIN_DAYS,
  }: Options
): VisaReport {
  const { shifts, excluded } = classifyEntries(entries, employers, { program, from, to });
  const days = workedDays(shifts);
  if (rule === "full_time_weeks") {
    fillFullTimeWeeks(days, { from, to, hours: program.fullTimeHours, weekStartsOn });
  }

  const list = [...days.values()].sort((a, b) => a.date.valueOf() - b.date.valueOf());
  for (const day of list)
    day.shifts.sort((a, b) => a.entry.date.valueOf() - b.entry.date.valueOf());

  const confirmedDays = list.filter((day) => day.status === "confirmed").length;
  const totalDays = list.length;

  return {
    program,
    rule,
    from: startOfDay(from),
    to: startOfDay(to),
    days: list,
    confirmedDays,
    assumedDays: totalDays - confirmedDays,
    totalDays,
    remainingDays: Math.max(0, program.targetDays - totalDays),
    minutes: shifts.reduce((sum, shift) => sum + shift.entry.minutes, 0),
    gaps: findGaps(list, gapMinDays),
    employers: byEmployer(shifts),
    excludedShifts: excluded,
  };
}

/**
 * Where a report for `country` would naturally start: the first shift for an
 * employer there, or `fallback` when there's none.
 */
export function firstShiftIn(
  entries: HistoryEntry[],
  employers: Map<number, ReportEmployer>,
  country: string,
  fallback: Date
) {
  let first: Date | null = null;
  for (const entry of entries) {
    const employer = entry.employerId === null ? undefined : employers.get(entry.employerId);
    if (!employer || visaCountryOf(employer.country) !== country) continue;
    if (!first || isBefore(entry.date, first)) first = entry.date;
  }
  return startOfDay(first ?? fallback);
}

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
import { type AuSubclass, eligibility } from "./eligibility";
import { type CountingRule, GAP_MIN_DAYS, type VisaProgram } from "./programs";

export * from "./country";
export * from "./eligibility";
export * from "./programs";

/** What the report needs to know about an employer. */
export type ReportEmployer = {
  id: number;
  name: string;
  country: string | null;
  visaWorkType?: string | null;
  postcode?: string | null;
  workPostcode?: string | null;
};

/**
 * - confirmed: the shift's employer is in the program's country and its work
 *   counts there.
 * - assumed: counted, but not proven: no employer (or no country), or the
 *   employer lacks the kind of work or postcode to check it (shown in red
 *   until the user completes it).
 * - not_eligible: the employer's work doesn't count for this visa, or not
 *   where it's done; left out of the total (shown in amber).
 */
export type EntryStatus = "confirmed" | "assumed" | "not_eligible";

/** Why a shift is assumed. */
export type AssumedReason =
  "no_employer" | "no_country" | "no_work_type" | "no_postcode" | "recovery";

/** Why a shift doesn't count. */
export type NotEligibleReason = "work_type" | "area";

export type ShiftReason = AssumedReason | NotEligibleReason;

export type ReportShift = {
  entry: HistoryEntry;
  status: EntryStatus;
  reason: ShiftReason | null;
};

/** Higher wins when a day has shifts of several statuses. */
const RANK: Record<EntryStatus, number> = { not_eligible: 0, assumed: 1, confirmed: 2 };

/** Whether a day or shift counts towards the target. */
export function counts(status: EntryStatus) {
  return status !== "not_eligible";
}

export type ReportDay = {
  /** Start of the day. */
  date: Date;
  /** yyyy-MM-dd */
  key: string;
  /** Minutes worked that day (0 for a day counted by a full-time week). */
  minutes: number;
  /** The best of its shifts: confirmed, else assumed, else not_eligible (not counted). */
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
  reason: ShiftReason | null;
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
  subclass: AuSubclass | null;
  from: Date;
  to: Date;
  /** Every day worked or counted, oldest first; not_eligible ones don't count. */
  days: ReportDay[];
  /** Counted days backed by a confirmed shift (or a full-time week of them). */
  confirmedDays: number;
  /** Counted days that rest on assumed shifts only. */
  assumedDays: number;
  totalDays: number;
  /** Days worked only for employers whose work doesn't count. */
  notEligibleDays: number;
  /** Days still missing to reach the target (0 once reached). */
  remainingDays: number;
  /** Minutes of the shifts that count (confirmed and assumed). */
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
  /** Australian subclass whose rules apply; the program's first one by default. */
  subclass?: AuSubclass;
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
  { program, from, to, subclass }: Pick<Options, "program" | "from" | "to" | "subclass">
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
    if (country === null) {
      shifts.push({ entry, status: "assumed", reason: "no_country" });
    } else if (country !== program.country) {
      excluded += 1;
    } else {
      const check = eligibility(
        {
          visaWorkType: employer.visaWorkType ?? null,
          postcode: employer.postcode ?? null,
          workPostcode: employer.workPostcode ?? null,
        },
        program.country,
        subclass ?? program.subclasses?.[0]
      );
      if (check.status === "eligible") shifts.push({ entry, status: "confirmed", reason: null });
      else if (check.status === "unknown")
        shifts.push({ entry, status: "assumed", reason: check.reason });
      else shifts.push({ entry, status: "not_eligible", reason: check.reason });
    }
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
      status: shift.status,
      filled: false,
      shifts: [],
    };
    day.minutes += shift.entry.minutes;
    day.shifts.push(shift);
    if (RANK[shift.status] > RANK[day.status]) day.status = shift.status;
    days.set(key, day);
  }
  return days;
}

/**
 * Full-time weeks: a week (inside the period) with `hours` or more counts its
 * 7 days. The added days are confirmed when the confirmed hours alone reach
 * the mark, assumed otherwise. Hours that don't count don't add up.
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
      if (!counts(shift.status)) continue;
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
      } else if (RANK[status] > RANK[day.status]) {
        // A day worked only for work that doesn't count, inside a full-time week.
        if (!counts(day.status)) day.filled = true;
        day.status = status;
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
        // Confirmed first, then assumed, then not eligible; then by when the work started.
        RANK[b.status] - RANK[a.status] || a.first.valueOf() - b.first.valueOf()
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
    subclass = program.subclasses?.[0],
    weekStartsOn = 1,
    gapMinDays = GAP_MIN_DAYS,
  }: Options
): VisaReport {
  const { shifts, excluded } = classifyEntries(entries, employers, {
    program,
    from,
    to,
    subclass,
  });
  const days = workedDays(shifts);
  if (rule === "full_time_weeks") {
    fillFullTimeWeeks(days, { from, to, hours: program.fullTimeHours, weekStartsOn });
  }

  const list = [...days.values()].sort((a, b) => a.date.valueOf() - b.date.valueOf());
  for (const day of list)
    day.shifts.sort((a, b) => a.entry.date.valueOf() - b.entry.date.valueOf());

  const counted = list.filter((day) => counts(day.status));
  const confirmedDays = counted.filter((day) => day.status === "confirmed").length;
  const totalDays = counted.length;

  return {
    program,
    rule,
    subclass: subclass ?? null,
    from: startOfDay(from),
    to: startOfDay(to),
    days: list,
    confirmedDays,
    assumedDays: totalDays - confirmedDays,
    totalDays,
    notEligibleDays: list.length - totalDays,
    remainingDays: Math.max(0, program.targetDays - totalDays),
    minutes: shifts
      .filter((shift) => counts(shift.status))
      .reduce((sum, shift) => sum + shift.entry.minutes, 0),
    // Breaks without any work, so days that don't count still end one.
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

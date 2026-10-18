import { describe, expect, test } from "vitest";

import {
  compareWithPreviousMonth,
  runningShiftEarnings,
  summarizeWeek,
  usualShiftMinutes,
  weekStartsOnIndex,
} from "@/services/Summary";

import type { HourlyType, ProductionType } from "@/types";

function hourly(start: string, hours: number, extra: Partial<HourlyType> = {}): HourlyType {
  const s = new Date(start);
  const e = new Date(s.valueOf() + hours * 3600e3);
  return {
    id: Math.floor(Math.random() * 1e6),
    name: "Packhouse",
    startDate: s.toString(),
    endDate: e.toString(),
    amount: hours * 60,
    isPublicHoliday: false,
    publicHolidayWorked: false,
    isClosed: true,
    notes: null,
    hourValue: 20,
    unpaidBreaks: 0,
    shiftId: 1,
    ...extra,
  } as HourlyType;
}

function production(start: string, qty: number, value: number): ProductionType {
  return {
    id: Math.floor(Math.random() * 1e6),
    name: "Apples",
    startDate: new Date(start).toString(),
    endDate: new Date(new Date(start).valueOf() + 3600e3).toString(),
    amount: 60,
    isPublicHoliday: false,
    publicHolidayWorked: false,
    isClosed: true,
    notes: null,
    itemValue: value,
    itemQuantity: qty,
    shiftId: 1,
  } as ProductionType;
}

describe("Summary service", () => {
  test("maps the weekStartsOn setting", () => {
    expect(weekStartsOnIndex("sunday")).toBe(0);
    expect(weekStartsOnIndex("Monday")).toBe(1);
    expect(weekStartsOnIndex(undefined)).toBe(1);
  });

  test("summarizes the current week and splits days by type", () => {
    // Wednesday 2026-10-14; week Mon 12 to Sun 18
    const now = new Date(2026, 9, 14, 18, 0);
    const week = summarizeWeek(
      [
        hourly("2026-10-12T09:00:00", 8),
        hourly("2026-10-13T09:00:00", 4),
        hourly("2026-10-05T09:00:00", 8), // previous week
        hourly("2026-10-14T09:00:00", 2, { isClosed: false }), // still open
      ],
      [production("2026-10-13T14:00:00", 10, 3)],
      { now, weekStartsOn: 1 }
    );

    expect(week.shifts).toBe(3);
    expect(week.minutes).toBe(8 * 60 + 4 * 60 + 60);
    expect(week.earned).toBeCloseTo(8 * 20 + 4 * 20 + 30, 2);
    expect(week.days).toHaveLength(7);
    expect(week.days[0].hourly).toBeCloseTo(160, 2);
    expect(week.days[1].hourly).toBeCloseTo(80, 2);
    expect(week.days[1].production).toBeCloseTo(30, 2);
    expect(week.days[2].hourly).toBe(0);
  });

  test("compares this month so far with the same days of last month", () => {
    const now = new Date(2026, 9, 10, 20, 0); // Oct 10
    const result = compareWithPreviousMonth(
      [
        hourly("2026-10-02T09:00:00", 10), // 200
        hourly("2026-09-03T09:00:00", 5), // 100, inside Sep 1-10
        hourly("2026-09-25T09:00:00", 8), // outside the compared stretch
      ],
      [],
      now
    );

    expect(result.current.earned).toBeCloseTo(200, 2);
    expect(result.previous.earned).toBeCloseTo(100, 2);
    expect(result.change).toBe(100);
    expect(result.previousFull.earned).toBeCloseTo(260, 2);
    expect(result.shareOfPrevious).toBe(77);
  });

  test("a shift late last month still counts for the whole-month comparison", () => {
    // Oct 18; the only September shift is on the 24th, outside Sep 1-18
    const result = compareWithPreviousMonth(
      [hourly("2026-09-24T08:00:00", 10), hourly("2026-10-05T08:00:00", 5)],
      [],
      new Date(2026, 9, 18, 18, 0)
    );

    expect(result.change).toBeNull();
    expect(result.previousFull.earned).toBeCloseTo(200, 2);
    expect(result.shareOfPrevious).toBe(50);
  });

  test("has no change when last month had no earnings", () => {
    const result = compareWithPreviousMonth([hourly("2026-10-02T09:00:00", 1)], [], new Date(2026, 9, 5));
    expect(result.change).toBeNull();
  });

  test("usual shift is the median of recent closed shifts", () => {
    expect(usualShiftMinutes([hourly("2026-10-01T09:00:00", 8)])).toBeNull();
    expect(
      usualShiftMinutes([
        hourly("2026-10-01T09:00:00", 6),
        hourly("2026-10-02T09:00:00", 8),
        hourly("2026-10-03T09:00:00", 10),
        hourly("2026-10-04T09:00:00", 8, { isClosed: false }),
      ])
    ).toBe(480);
  });

  test("running earnings use the open shift's own rate", () => {
    const start = new Date(2026, 9, 18, 9, 0);
    const now = new Date(2026, 9, 18, 12, 0);
    expect(
      runningShiftEarnings({ startDate: start.toString(), hourValue: 20, unpaidBreaks: 0 }, now)
    ).toBeCloseTo(60, 2);
  });
});

import { describe, expect, test } from "vitest";

import ShiftService from "@/services/Shift";
import { goalProgress, goalRange } from "@/services/Summary";

import { roundShiftTimes, roundToStep } from "@/utils/helpers/roundShift";

describe("roundToStep", () => {
  test("nearest step", () => {
    expect(roundToStep(new Date(2026, 9, 28, 8, 7), 5)).toEqual(new Date(2026, 9, 28, 8, 5));
    expect(roundToStep(new Date(2026, 9, 28, 8, 8), 5)).toEqual(new Date(2026, 9, 28, 8, 10));
    expect(roundToStep(new Date(2026, 9, 28, 8, 7), 15)).toEqual(new Date(2026, 9, 28, 8, 0));
    expect(roundToStep(new Date(2026, 9, 28, 16, 53), 15)).toEqual(new Date(2026, 9, 28, 17, 0));
  });

  test("0 keeps it exact", () => {
    const at = new Date(2026, 9, 28, 8, 7, 31);
    expect(roundToStep(at, 0)).toEqual(at);
  });
});

describe("roundShiftTimes", () => {
  test("rounds both ends", () => {
    const { start, end } = roundShiftTimes(
      new Date(2026, 9, 28, 7, 58),
      new Date(2026, 9, 28, 16, 4),
      15
    );
    expect(start).toEqual(new Date(2026, 9, 28, 8, 0));
    expect(end).toEqual(new Date(2026, 9, 28, 16, 0));
  });

  test("a shift too short to round stays exact", () => {
    const start = new Date(2026, 9, 28, 8, 1);
    const end = new Date(2026, 9, 28, 8, 6);
    expect(roundShiftTimes(start, end, 15)).toEqual({ start, end });
  });
});

describe("holiday rate", () => {
  const base = {
    startDate: new Date(2026, 9, 26, 8, 0).toString(),
    endDate: new Date(2026, 9, 26, 12, 0).toString(),
    hourValue: 20,
    unpaidBreaks: 0,
    isPublicHoliday: true,
    publicHolidayWorked: true,
  };

  test("hourly: the shift's own rate, else 1.5", () => {
    expect(new ShiftService({ ...base }).calculateEarnings()).toBe(120); // 4h × 20 × 1.5
    expect(new ShiftService({ ...base, holidayRate: 2 }).calculateEarnings()).toBe(160);
    expect(new ShiftService({ ...base, holidayRate: 1 }).calculateEarnings()).toBe(80);
  });

  test("hourly: not worked, no multiplier", () => {
    expect(
      new ShiftService({ ...base, publicHolidayWorked: false, holidayRate: 2 }).calculateEarnings()
    ).toBe(80);
  });

  test("production: the shift's own rate, else 1.5", () => {
    const shift = { itemValue: 2, itemQuantity: 10, publicHolidayWorked: true };
    expect(new ShiftService(shift).calculateEarnings()).toBe(30);
    expect(new ShiftService({ ...shift, holidayRate: 2.25 }).calculateEarnings()).toBe(45);
  });
});

describe("goalProgress", () => {
  test("partway", () => {
    expect(goalProgress(300, 800)).toEqual({
      earned: 300,
      goal: 800,
      ratio: 0.375,
      remaining: 500,
      reached: false,
    });
  });

  test("reached and over: the bar stops at full", () => {
    expect(goalProgress(950, 800)).toMatchObject({ ratio: 1, remaining: 0, reached: true });
  });

  test("no goal", () => {
    expect(goalProgress(100, 0)).toMatchObject({ ratio: 0, reached: false });
  });
});

describe("goalRange", () => {
  const now = new Date(2026, 9, 28, 12, 0); // Wednesday

  test("week, Monday first", () => {
    const { from, to } = goalRange("week", { now, weekStartsOn: 1 });
    expect(from).toEqual(new Date(2026, 9, 26));
    expect(to.getDate()).toBe(1); // Sunday 1 Nov
  });

  test("calendar month", () => {
    const { from, to } = goalRange("month", { now });
    expect(from).toEqual(new Date(2026, 9, 1));
    expect(to.getDate()).toBe(31);
  });
});

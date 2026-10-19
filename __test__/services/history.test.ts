import { describe, expect, test } from "vitest";

import {
  earningsSplit,
  groupByMonth,
  isPieceShift,
  monthlyEarnings,
  weeklyEarnings,
} from "@/services/Summary/history";

import type { HourlyType, ProductionType } from "@/types";

function hourly(start: string, hours: number, extra: Partial<HourlyType> = {}): HourlyType {
  const s = new Date(start);
  return {
    id: Math.floor(Math.random() * 1e6),
    name: "Packhouse",
    startDate: s.toString(),
    endDate: new Date(s.valueOf() + hours * 3600e3).toString(),
    amount: hours * 60,
    isPublicHoliday: false,
    publicHolidayWorked: false,
    isClosed: true,
    hourValue: 20,
    unpaidBreaks: 0,
    ...extra,
  } as HourlyType;
}

function piece(start: string, qty: number, value: number): ProductionType {
  return {
    id: Math.floor(Math.random() * 1e6),
    name: "Apples",
    startDate: new Date(start).toString(),
    endDate: new Date(new Date(start).valueOf() + 3600e3).toString(),
    isPublicHoliday: false,
    publicHolidayWorked: false,
    isClosed: true,
    itemValue: value,
    itemQuantity: qty,
  } as ProductionType;
}

const now = new Date(2026, 9, 19, 12, 0); // Mon 19 Oct

describe("history", () => {
  test("tells per-piece shifts from hourly ones", () => {
    expect(isPieceShift(piece("2026-10-01T08:00:00", 1, 1))).toBe(true);
    expect(isPieceShift(hourly("2026-10-01T08:00:00", 1))).toBe(false);
  });

  test("groups by month, newest first, with totals", () => {
    const groups = groupByMonth([
      hourly("2026-09-24T08:00:00", 10), // 200
      hourly("2026-10-05T08:00:00", 5), // 100
      piece("2026-10-12T08:00:00", 10, 3), // 30
      hourly("2026-10-14T08:00:00", 1, { isClosed: false }), // running, left out
    ]);
    expect(groups.map((g) => g.key)).toEqual(["2026-10", "2026-09"]);
    expect(groups[0].total).toBeCloseTo(130, 2);
    expect(groups[0].shifts).toHaveLength(2);
    expect(groups[0].label).toBe("October 2026");
  });

  test("weekly earnings: one bucket per week, oldest first", () => {
    const weeks = weeklyEarnings(
      [hourly("2026-10-13T08:00:00", 5), hourly("2026-10-19T08:00:00", 2)],
      [piece("2026-10-14T08:00:00", 10, 3)],
      { weeks: 3, now }
    );
    expect(weeks.map((w) => w.label)).toEqual(["5 Oct", "12 Oct", "19 Oct"]);
    expect(weeks[1]).toMatchObject({ hourly: 100, production: 30 });
    expect(weeks[2]).toMatchObject({ hourly: 40, production: 0 });
  });

  test("monthly earnings and the split between types", () => {
    const h = [hourly("2026-09-24T08:00:00", 10)];
    const p = [piece("2026-10-12T08:00:00", 100, 2)];
    expect(monthlyEarnings(h, p, { months: 2, now })).toEqual([
      { label: "Sep", hourly: 200, production: 0 },
      { label: "Oct", hourly: 0, production: 200 },
    ]);
    expect(earningsSplit(h, p)).toMatchObject({ hourlyShare: 50, productionShare: 50, total: 400 });
    expect(earningsSplit([], [])).toMatchObject({ total: 0, hourlyShare: 0 });
  });
});

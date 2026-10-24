import { describe, expect, test } from "vitest";

import {
  countByEmployer,
  countDays,
  cumulativeEarnings,
  entriesForDays,
  filterEntries,
  groupByMonth,
  historyEntries,
  weeklyEarnings,
} from "@/services/History";

import type { HourlyType, ProductionType } from "@/types";

function hourly(start: Date, hours: number, extra: Partial<HourlyType> = {}): HourlyType {
  return {
    id: Math.floor(Math.random() * 1e6),
    name: "Packhouse",
    startDate: start.toString(),
    endDate: new Date(start.valueOf() + hours * 3600e3).toString(),
    amount: hours * 60,
    isPublicHoliday: false,
    publicHolidayWorked: false,
    isClosed: true,
    notes: null,
    hourValue: 20,
    unpaidBreaks: 0,
    shiftId: 1,
    currency: null,
    source: null,
    taxes: [],
    ...extra,
  } as HourlyType;
}

function production(start: Date, qty: number, value: number, extra: Partial<ProductionType> = {}) {
  return {
    id: Math.floor(Math.random() * 1e6),
    name: "Apples",
    startDate: start.toString(),
    endDate: new Date(start.valueOf() + 3600e3).toString(),
    amount: 60,
    isPublicHoliday: false,
    publicHolidayWorked: false,
    isClosed: true,
    notes: null,
    itemValue: value,
    itemQuantity: qty,
    shiftId: 1,
    currency: null,
    taxes: [],
    ...extra,
  } as ProductionType;
}

describe("History service", () => {
  const entries = historyEntries(
    [
      hourly(new Date(2026, 9, 12, 8), 8, {
        taxes: [{ id: 1, name: "PAYE", value: 10, description: null }] as any,
      }),
      hourly(new Date(2026, 8, 25, 8), 5),
      hourly(new Date(2026, 9, 14, 8), 2, { isClosed: false }),
    ],
    [
      production(new Date(2026, 9, 13, 9), 10, 3, {
        publicHolidayWorked: true,
        isPublicHoliday: true,
      }),
    ]
  );

  test("closed shifts of both kinds, newest first, with after-tax and holiday", () => {
    expect(entries.map((e) => e.kind)).toEqual(["production", "hourly", "hourly"]);
    expect(entries[1].earned).toBeCloseTo(160, 2);
    expect(entries[1].afterTaxes).toBeCloseTo(144, 2);
    expect(entries[0].holiday).toBe("worked");
  });

  test("groups by month with totals", () => {
    const groups = groupByMonth(entries);
    expect(groups.map((g) => g.label)).toEqual(["October 2026", "September 2026"]);
    expect(groups[1].totals).toEqual([{ currency: "USD", amount: 100 }]);
  });

  test("month totals never add up different currencies", () => {
    const mixed = historyEntries(
      [
        hourly(new Date(2026, 9, 5, 9), 5), // $100, saved without a currency
        hourly(new Date(2026, 9, 6, 9), 2, { currency: "EUR" }), // €40
        hourly(new Date(2026, 9, 7, 9), 1, { currency: "USD" }), // $20
      ],
      []
    );
    expect(groupByMonth(mixed, "USD")[0].totals).toEqual([
      { currency: "USD", amount: 120 },
      { currency: "EUR", amount: 40 },
    ]);
  });

  test("weekly earnings split by kind, oldest first, empty weeks included", () => {
    const weeks = weeklyEarnings(entries, {
      weeks: 4,
      now: new Date(2026, 9, 18),
      weekStartsOn: 1,
    });
    expect(weeks).toHaveLength(4);
    expect(weeks.at(-1)?.hourly).toBe(160);
    expect(weeks.at(-1)?.production).toBeGreaterThan(0);
    expect(weeks[0].hourly).toBeCloseTo(100, 2); // week of Sep 21
    expect(weeks[1].hourly).toBe(0); // nothing between Sep 28 and Oct 4
  });

  test("cumulative totals per kind, one point per day", () => {
    const points = cumulativeEarnings(entries);
    expect(points).toHaveLength(3);
    expect(points[0].hourly).toBeCloseTo(100, 2);
    expect(points.at(-1)?.hourly).toBeCloseTo(260, 2);
    expect(points.at(-1)?.production).toBe(points[2].production);
  });
});

describe("entriesForDays", () => {
  // Ten days in October, two shifts on the 30th.
  const shifts = [
    ...Array.from({ length: 10 }, (_, i) => hourly(new Date(2026, 9, 21 + i, 8), 4)),
    hourly(new Date(2026, 9, 30, 14), 3),
  ];
  const entries = historyEntries(shifts, []);

  test("keeps whole days, newest first", () => {
    const visible = entriesForDays(entries, 7);
    expect(countDays(visible)).toBe(7);
    // Both shifts of the 30th, then the 29th back to the 24th.
    expect(visible).toHaveLength(8);
    expect(visible.at(-1)?.date.getDate()).toBe(24);
  });

  test("returns everything when there are fewer days", () => {
    expect(entriesForDays(entries, 30)).toHaveLength(entries.length);
    expect(countDays(entries)).toBe(10);
  });
});

describe("filterEntries", () => {
  const day = new Date(2026, 9, 20, 8);
  const entries = historyEntries(
    [hourly(day, 8, { employerId: 1 }), hourly(day, 6, { employerId: 2 }), hourly(day, 4)],
    [production(day, 100, 0.5, { employerId: 1 })]
  );

  test("by employer, of every kind", () => {
    const farm = filterEntries(entries, { employer: 1 });
    expect(farm).toHaveLength(2);
    expect(farm.every((e) => e.employerId === 1)).toBe(true);
  });

  test("shifts without an employer", () => {
    const none = filterEntries(entries, { employer: "none" });
    expect(none).toHaveLength(1);
    expect(none[0].employerId).toBeNull();
  });

  test("kind and employer together", () => {
    expect(filterEntries(entries, { kind: "production", employer: 1 })).toHaveLength(1);
    expect(filterEntries(entries, { kind: "production", employer: 2 })).toHaveLength(0);
  });

  test("everything when nothing is filtered", () => {
    expect(filterEntries(entries, {})).toHaveLength(entries.length);
  });

  test("counts the shifts of each employer, and those without one", () => {
    const counts = countByEmployer(entries);
    expect(counts.get(1)).toBe(2);
    expect(counts.get(2)).toBe(1);
    expect(counts.get("none")).toBe(1);
  });
});

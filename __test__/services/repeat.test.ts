import { describe, expect, test } from "vitest";

import { lastClosedHourly, planRepeat } from "@/services/Summary/repeat";

import type { HourlyType } from "@/types";

function shift(start: string, end: string | null, extra: Partial<HourlyType> = {}): HourlyType {
  return {
    id: Math.floor(Math.random() * 1e6),
    name: "Packhouse",
    startDate: new Date(start).toString(),
    endDate: end ? new Date(end).toString() : null,
    isClosed: !!end,
    hourValue: 25,
    unpaidBreaks: 30,
    ...extra,
  } as HourlyType;
}

describe("repeat last shift", () => {
  const yesterday = shift("2026-10-18T07:30:00", "2026-10-18T16:00:00");

  test("picks the latest closed shift", () => {
    const older = shift("2026-10-10T08:00:00", "2026-10-10T12:00:00");
    expect(lastClosedHourly([older, yesterday])).toBe(yesterday);
  });

  test("moves it to today with the same hours", () => {
    const plan = planRepeat([yesterday], new Date(2026, 9, 19, 18, 0));
    expect(plan).toMatchObject({
      startDate: "2026-10-19",
      startTime: "07:30",
      finishDate: "2026-10-19",
      finishTime: "16:00",
    });
  });

  test("keeps overnight shifts overnight", () => {
    const night = shift("2026-10-17T22:00:00", "2026-10-18T06:00:00");
    const plan = planRepeat([night], new Date(2026, 9, 19, 9, 0));
    expect(plan).toMatchObject({ startDate: "2026-10-19", finishDate: "2026-10-20", finishTime: "06:00" });
  });

  test("not offered before 24h have passed", () => {
    expect(planRepeat([yesterday], new Date(2026, 9, 19, 7, 0))).toBeNull();
    expect(planRepeat([yesterday], new Date(2026, 9, 19, 7, 30))).not.toBeNull();
  });

  test("not offered while a shift is running or with no history", () => {
    expect(planRepeat([yesterday, shift("2026-10-19T08:00:00", null)], new Date(2026, 9, 20))).toBeNull();
    expect(planRepeat([], new Date())).toBeNull();
  });
});

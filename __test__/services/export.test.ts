import { describe, expect, test } from "vitest";

import { shiftsToCsv } from "@/services/Export";

import type { HourlyType } from "@/types";

const shift = {
  id: 1,
  name: 'Packhouse, "night"',
  startDate: new Date(2026, 9, 18, 8, 0).toString(),
  endDate: new Date(2026, 9, 18, 16, 0).toString(),
  amount: 480,
  isClosed: true,
  isPublicHoliday: false,
  publicHolidayWorked: false,
  hourValue: 25,
  unpaidBreaks: 0,
  notes: "line 1\nline 2",
  currency: "EUR",
  taxes: [{ id: 1, name: "PAYE", value: 10, description: null }],
} as unknown as HourlyType;

describe("shiftsToCsv", () => {
  test("one header row and one row per shift, escaped", () => {
    const csv = shiftsToCsv([shift], [], "USD");
    const [header] = csv.split("\n");
    expect(header.startsWith("Type,Job,Start,Finish,Hours")).toBe(true);
    expect(csv).toContain('"Packhouse, ""night"""');
    expect(csv).toContain("2026-10-18 08:00,2026-10-18 16:00,8.00,25");
    expect(csv).toContain("200.00,180.00,EUR,PAYE 10%");
    expect(csv).toContain('"line 1\nline 2"');
  });

  test("shifts without a currency use the default", () => {
    const csv = shiftsToCsv([{ ...shift, currency: null }], [], "NZD");
    expect(csv).toContain(",NZD,");
  });
});

import { describe, expect, test } from "vitest";

import { contributionRate, withContributions } from "@/services/Contribution/math";
import { CONTRIBUTION_PRESETS } from "@/services/Contribution/presets";
import ShiftService from "@/services/Shift";

const holidayPay = { name: "Holiday pay (NZ)", value: 8, description: null };
const loading = { name: "Casual loading (AU)", value: 25, description: null };

describe("contributions", () => {
  test("rates are summed, not compounded", () => {
    expect(contributionRate([holidayPay, loading])).toBe(33);
    expect(withContributions(100, [holidayPay, loading])).toBe(133);
  });

  test("no contributions leave the pay as it is", () => {
    expect(withContributions(123.456, [])).toBe(123.456);
    expect(withContributions(123.456, null)).toBe(123.456);
  });

  test("a shift's earnings include its contributions", () => {
    const shift = {
      startDate: new Date(2026, 9, 20, 8).toString(),
      endDate: new Date(2026, 9, 20, 16).toString(),
      hourValue: 25,
      unpaidBreaks: 0,
      isPublicHoliday: false,
      publicHolidayWorked: false,
    };
    const base = new ShiftService(shift).calculateEarnings();
    const withHolidayPay = new ShiftService({
      ...shift,
      contributions: [{ ...holidayPay, id: 1, archived: false, userId: "u" }],
    }).calculateEarnings();

    expect(base).toBe(200);
    expect(withHolidayPay).toBe(216);
  });

  test("presets have unique ids and sane rates", () => {
    const ids = CONTRIBUTION_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const preset of CONTRIBUTION_PRESETS) {
      expect(preset.value).toBeGreaterThan(0);
      expect(preset.value).toBeLessThanOrEqual(100);
    }
  });
});

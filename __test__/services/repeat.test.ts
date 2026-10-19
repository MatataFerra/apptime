import { describe, expect, test } from "vitest";

import { repeatableFastCharge } from "@/services/Repeat";

import type { HourlyType } from "@/types";

function shift(start: Date, hours: number, extra: Partial<HourlyType> = {}): HourlyType {
  return {
    id: Math.floor(Math.random() * 1e6),
    name: "Picking",
    startDate: start.toString(),
    endDate: new Date(start.valueOf() + hours * 3600e3).toString(),
    amount: hours * 60,
    isPublicHoliday: false,
    publicHolidayWorked: false,
    isClosed: true,
    notes: null,
    hourValue: 25,
    unpaidBreaks: 30,
    shiftId: 1,
    currency: null,
    source: "fast",
    ...extra,
  } as HourlyType;
}

const now = new Date(2026, 9, 20, 17, 30); // Tue 20 Oct, 17:30

describe("repeatableFastCharge", () => {
  test("offers yesterday's Fast charge for today, same time and length", () => {
    const plan = repeatableFastCharge([shift(new Date(2026, 9, 19, 8, 0), 8)], now);
    expect(plan?.start).toEqual(new Date(2026, 9, 20, 8, 0));
    expect(plan?.end).toEqual(new Date(2026, 9, 20, 16, 0));
    expect(plan?.last.name).toBe("Picking");
  });

  test("works before 24h have passed, as long as it's another day", () => {
    const plan = repeatableFastCharge(
      [shift(new Date(2026, 9, 19, 16, 0), 8)],
      new Date(2026, 9, 20, 9, 0)
    );
    expect(plan).not.toBeNull();
  });

  test("not offered again the same day", () => {
    expect(repeatableFastCharge([shift(new Date(2026, 9, 20, 8, 0), 8)], now)).toBeNull();
  });

  test("uses the latest Fast charge and ignores Track and open shifts", () => {
    const plan = repeatableFastCharge(
      [
        shift(new Date(2026, 9, 15, 7, 0), 9, { name: "Older" }),
        shift(new Date(2026, 9, 18, 9, 0), 6, { name: "Latest" }),
        shift(new Date(2026, 9, 19, 8, 0), 8, { source: "track", name: "Tracked" }),
        shift(new Date(2026, 9, 19, 8, 0), 8, { isClosed: false, name: "Open" }),
      ],
      now
    );
    expect(plan?.last.name).toBe("Latest");
    expect(plan?.end).toEqual(new Date(2026, 9, 20, 15, 0));
  });

  test("nothing to repeat without a Fast charge", () => {
    expect(
      repeatableFastCharge([shift(new Date(2026, 9, 19, 8, 0), 8, { source: null })], now)
    ).toBeNull();
    expect(repeatableFastCharge([], now)).toBeNull();
  });
});

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

const now = new Date(2026, 9, 20, 9, 30); // Tue 20 Oct, 09:30

describe("repeatableFastCharge", () => {
  test("offers yesterday's Fast charge for today, same time and length", () => {
    const plan = repeatableFastCharge([shift(new Date(2026, 9, 19, 8, 0), 8)], now);
    expect(plan?.start).toEqual(new Date(2026, 9, 20, 8, 0));
    expect(plan?.end).toEqual(new Date(2026, 9, 20, 16, 0));
    expect(plan?.last.name).toBe("Picking");
  });

  test("not offered until 8h after the shift ended", () => {
    const last = [shift(new Date(2026, 9, 19, 16, 0), 8)]; // ends 20 Oct 00:00
    expect(repeatableFastCharge(last, new Date(2026, 9, 20, 7, 59))).toBeNull();
    expect(repeatableFastCharge(last, new Date(2026, 9, 20, 8, 0))).not.toBeNull();
  });

  test("offered all of the next day, however late it ended (until midnight)", () => {
    // Tue 27 Oct 08:15–17:45: still offered on Wed 28 at 21:37 and 23:59.
    const last = [shift(new Date(2026, 9, 27, 8, 15), 9.5)];
    expect(repeatableFastCharge(last, new Date(2026, 9, 28, 21, 37))).not.toBeNull();
    expect(repeatableFastCharge(last, new Date(2026, 9, 28, 23, 59))).not.toBeNull();
    expect(repeatableFastCharge(last, new Date(2026, 9, 29, 0, 0))).toBeNull();
  });

  test("a shift two days old is no longer offered", () => {
    const last = [shift(new Date(2026, 9, 19, 8, 0), 8)];
    expect(repeatableFastCharge(last, new Date(2026, 9, 21, 9, 0))).toBeNull();
  });

  test("night shift: offered the same calendar day once 8h have passed", () => {
    const last = [shift(new Date(2026, 9, 19, 18, 0), 8)]; // ends 20 Oct 02:00
    const plan = repeatableFastCharge(last, new Date(2026, 9, 20, 11, 0));
    expect(plan?.start).toEqual(new Date(2026, 9, 20, 18, 0));
  });

  test("not offered right after logging it (a second one is a duplicate)", () => {
    expect(
      repeatableFastCharge([shift(new Date(2026, 9, 20, 0, 0), 8)], new Date(2026, 9, 20, 9, 0))
    ).toBeNull();
  });

  test("uses the latest Fast charge and ignores Track and open shifts", () => {
    const plan = repeatableFastCharge(
      [
        shift(new Date(2026, 9, 15, 7, 0), 9, { name: "Older" }),
        shift(new Date(2026, 9, 19, 9, 0), 6, { name: "Latest" }),
        shift(new Date(2026, 9, 19, 10, 0), 8, { source: "track", name: "Tracked" }),
        shift(new Date(2026, 9, 19, 10, 0), 8, { isClosed: false, name: "Open" }),
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

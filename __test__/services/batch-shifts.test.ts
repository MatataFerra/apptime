import { describe, expect, test } from "vitest";

import {
  buildBatchDays,
  findOverlaps,
  MAX_BATCH_DAYS,
  overlaps,
} from "@/utils/helpers/batchShifts";

const WEEKDAYS = [1, 2, 3, 4, 5] as const;

function days(result: ReturnType<typeof buildBatchDays>) {
  if (!result.ok) throw new Error(result.error);
  return result.days;
}

describe("buildBatchDays", () => {
  test("repeats the first shift's hours on the chosen weekdays, until included", () => {
    // Mon 2026-10-05 → Sun 2026-10-18, weekdays only.
    const result = days(
      buildBatchDays({
        start: "2026-10-05T08:00",
        finish: "2026-10-05T16:30",
        until: "2026-10-18",
        weekdays: [...WEEKDAYS],
      })
    );

    expect(result.map((d) => d.key)).toEqual([
      "2026-10-05",
      "2026-10-06",
      "2026-10-07",
      "2026-10-08",
      "2026-10-09",
      "2026-10-12",
      "2026-10-13",
      "2026-10-14",
      "2026-10-15",
      "2026-10-16",
    ]);
    const last = result.at(-1)!;
    expect([last.start.getHours(), last.start.getMinutes()]).toEqual([8, 0]);
    expect([last.end.getHours(), last.end.getMinutes()]).toEqual([16, 30]);
  });

  test("the first day is skipped when its weekday isn't chosen", () => {
    const result = days(
      buildBatchDays({
        start: "2026-10-05T08:00", // Monday
        finish: "2026-10-05T12:00",
        until: "2026-10-11",
        weekdays: [6, 0],
      })
    );
    expect(result.map((d) => d.key)).toEqual(["2026-10-10", "2026-10-11"]);
  });

  test("a night shift keeps finishing the next morning", () => {
    const [a, b] = days(
      buildBatchDays({
        start: "2026-10-30T22:00",
        finish: "2026-10-31T06:00",
        until: "2026-11-01",
        weekdays: [0, 1, 2, 3, 4, 5, 6],
      })
    );
    expect(a.key).toBe("2026-10-30");
    expect(a.end.getDate()).toBe(31);
    expect(b.end.getMonth()).toBe(10); // November 1st
    expect(b.end.getDate()).toBe(1);
    expect(b.end.getHours()).toBe(6);
  });

  test("hours stay as typed across a DST change", () => {
    // Europe moves clocks on 2026-10-25; the wall-clock time must not shift.
    const result = days(
      buildBatchDays({
        start: "2026-10-24T09:00",
        finish: "2026-10-24T17:00",
        until: "2026-10-26",
        weekdays: [0, 1, 2, 3, 4, 5, 6],
      })
    );
    for (const day of result) {
      expect(day.start.getHours()).toBe(9);
      expect(day.end.getHours()).toBe(17);
    }
  });

  test.each([
    [{ start: "", finish: "2026-10-05T16:00", until: "2026-10-09" }, "invalid_start"],
    [{ start: "2026-10-05T08:00", finish: "", until: "2026-10-09" }, "invalid_finish"],
    [
      { start: "2026-10-05T08:00", finish: "2026-10-05T08:00", until: "2026-10-09" },
      "finish_before_start",
    ],
    [{ start: "2026-10-05T08:00", finish: "2026-10-06T09:00", until: "2026-10-09" }, "too_long"],
    [
      { start: "2026-10-05T08:00", finish: "2026-10-05T16:00", until: "2026-02-31" },
      "invalid_until",
    ],
    [
      { start: "2026-10-05T08:00", finish: "2026-10-05T16:00", until: "2026-10-04" },
      "until_before_start",
    ],
  ])("rejects %o with %s", (pattern, error) => {
    expect(buildBatchDays({ ...pattern, weekdays: [...WEEKDAYS] })).toEqual({ ok: false, error });
  });

  test("caps the range and needs at least one weekday", () => {
    const base = { start: "2026-01-01T08:00", finish: "2026-01-01T16:00" };
    // Day 1 + 61 more = 62 days: allowed. One more is not.
    expect(buildBatchDays({ ...base, until: "2026-03-03", weekdays: [1] }).ok).toBe(true);
    expect(MAX_BATCH_DAYS).toBe(62);
    expect(buildBatchDays({ ...base, until: "2026-03-04", weekdays: [1] })).toEqual({
      ok: false,
      error: "range_too_long",
    });
    expect(buildBatchDays({ ...base, until: "2026-01-10", weekdays: [] })).toEqual({
      ok: false,
      error: "no_weekdays",
    });
  });
});

describe("overlaps", () => {
  const shift = {
    startDate: new Date("2026-10-05T08:00:00").toString(),
    endDate: new Date("2026-10-05T16:00:00").toString(),
  };

  test("shared minutes overlap, touching ends don't", () => {
    expect(
      overlaps(shift, { startDate: new Date(2026, 9, 5, 15), endDate: new Date(2026, 9, 5, 20) })
    ).toBe(true);
    expect(
      overlaps(shift, { startDate: new Date(2026, 9, 5, 16), endDate: new Date(2026, 9, 5, 20) })
    ).toBe(false);
  });

  test("a shift still running takes up time until now", () => {
    const running = { startDate: new Date(2026, 9, 5, 7).toString(), endDate: null };
    const now = new Date(2026, 9, 5, 10);
    expect(overlaps(running, shift, now)).toBe(true);
    expect(
      overlaps(
        running,
        { startDate: new Date(2026, 9, 5, 11), endDate: new Date(2026, 9, 5, 12) },
        now
      )
    ).toBe(false);
  });

  test("findOverlaps returns the clashing days", () => {
    const result = days(
      buildBatchDays({
        start: "2026-10-05T12:00",
        finish: "2026-10-05T18:00",
        until: "2026-10-07",
        weekdays: [...WEEKDAYS],
      })
    );
    expect([...findOverlaps(result, [shift])]).toEqual(["2026-10-05"]);
  });
});

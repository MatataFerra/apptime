import { describe, expect, test } from "vitest";

import { clonePlain } from "@/utils/helpers/clonePlain";

describe("clonePlain", () => {
  test("copies nested objects and arrays, so edits don't reach the original", () => {
    const shift = { id: 1, taxes: [{ id: 2, name: "PAYE" }], employer: { name: "Box Maker" } };
    const copy = clonePlain(shift);

    copy.taxes[0].name = "ACC";
    copy.taxes.push({ id: 3, name: "KiwiSaver" });
    copy.employer.name = "Packhouse";

    expect(copy).not.toBe(shift);
    expect(shift.taxes).toEqual([{ id: 2, name: "PAYE" }]);
    expect(shift.employer.name).toBe("Box Maker");
  });

  test("keeps dates as dates, and primitives and null as they are", () => {
    const start = new Date("2026-10-18T08:00:00.000Z");
    const copy = clonePlain({ start, notes: null, amount: 0, isClosed: false, name: "Day" });

    expect(copy.start).toBeInstanceOf(Date);
    expect(copy.start).not.toBe(start);
    expect(copy.start.toISOString()).toBe(start.toISOString());
    expect(copy).toMatchObject({ notes: null, amount: 0, isClosed: false, name: "Day" });
  });
});

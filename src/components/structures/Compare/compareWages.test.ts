import { describe, expect, test } from "vitest";

import { compareWages } from "./compareWages";

describe("compareWages", () => {
  test("nothing filled in", () => {
    expect(compareWages({}).winner).toBeNull();
  });

  test("per piece wins", () => {
    const r = compareWages({
      itemValue: "32",
      itemQuantity: "14",
      hourlyWage: "26",
      hoursWorked: "7",
      minutesWorked: "30",
    });
    expect(r.production).toBe(448);
    expect(r.hourly).toBe(195);
    expect(r.winner).toBe("production");
    expect(r.difference).toBe(253);
    expect(r.piecesToMatch).toBe(7);
  });

  test("per hour wins", () => {
    const r = compareWages({
      itemValue: "2",
      itemQuantity: "50",
      hourlyWage: "25",
      hoursWorked: "8",
    });
    expect(r.winner).toBe("hourly");
    expect(r.piecesToMatch).toBe(100);
  });
});

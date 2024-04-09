import { describe, expect, test } from "vitest";

import ProfileService from "@/services/Profile";
import ShiftService from "@/services/Shift";

describe("Profile Service", () => {
  test("should convert hourly rate in minute rate", () => {
    expect(ShiftService.convertHourlyRateInMinuteRate(10)).toBe(0.16666666666666666);
  });

  test("should convert float in hour with a number who starts with cero", () => {
    expect(ShiftService.convertFloatInHour(9.5)).toBe("09:30");
  });

  test("should convert float in hour", () => {
    expect(ShiftService.convertFloatInHour(10.5)).toBe("10:30");
  });

  test("should convert hour in float", () => {
    expect(ShiftService.convertHourInFloat("10:30")).toBe(10.5);
  });
});

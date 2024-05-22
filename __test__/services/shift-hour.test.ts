import { describe, expect, test } from "vitest";

import HourlyService from "@/services/Shift/Hourly";

describe("Hourly Service", () => {
  test("should convert hourly rate in minute rate", () => {
    expect(HourlyService.convertHourlyRateInMinuteRate(10)).toBe(0.16666666666666666);
  });

  test("should convert float in hour with a number who starts with cero", () => {
    expect(HourlyService.convertFloatInHour(9.5)).toBe("09:30");
  });

  test("should convert float in hour", () => {
    expect(HourlyService.convertFloatInHour(10.5)).toBe("10:30");
  });

  test("should convert hour in float", () => {
    expect(HourlyService.convertHourInFloat("10:30")).toBe(10.5);
  });
});

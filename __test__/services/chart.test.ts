import { addHours } from "date-fns";
import { describe, expect, test } from "vitest";

import ChartService from "@/services/Chart";

import type { UserType } from "@/types";

const start = "2021-09-01T00:00:00.000Z";
const end = "2021-09-01T08:00:00.000Z";

const SHIFTS: UserType["shifts"] = {
  id: 1,
  userId: "id",
  production: [],
  hourly: [
    {
      amount: 15,
      startDate: new Date(start).toString(),
      endDate: addHours(new Date(end), 8).toString(),
      name: "Permanent work in factory",
      id: 15,
      hourValue: 27,
      isClosed: true,
      isPublicHoliday: false,
      notes: "",
      publicHolidayWorked: false,
      shiftId: 1,
      unpaidBreaks: 1,
    },
  ],
};

describe("ChartService", () => {
  test("Check if ChartService is defined", () => {
    expect(ChartService).toBeDefined();
  });

  test("Should grouped shifts by date", () => {
    const chartService = new ChartService(SHIFTS, "hourly");
    const groupedShifts = chartService.groupByDays;
    expect(groupedShifts).toEqual({
      "1_de_sept_de_2021": [
        {
          amount: 15,
          endDate: "Thu Sep 02 2021 02:00:00 GMT+1000 (hora estándar de Australia oriental)",
          holidayPay: false,
          holidayPayRate: 0.5,
          hourValue: 27,
          id: 15,
          isClosed: true,
          isPublicHoliday: false,
          notes: "",
          publicHolidayWorked: false,
          shiftId: 1,
          shortDate: "1_de_sept_de_2021",
          startDate: "Wed Sep 01 2021 10:00:00 GMT+1000 (hora estándar de Australia oriental)",
          unpaidBreaks: 1,
        },
      ],
    });
  });

  test("Should calculate earnPerDay Chart", () => {
    const chartService = new ChartService(SHIFTS, "hourly");
    const earnsPerDay = chartService.earnsPerDay();
    expect(earnsPerDay).toEqual([
      {
        date: "1 de sept de 2021",
        earnings: 405,
      },
    ]);
  });
});

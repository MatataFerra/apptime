import { isThisWeek, max } from "date-fns";
import _ from "lodash";
import { describe, expect,test } from "vitest";

import DashboardService from "@/services/Dashboard";
import ShiftService from "@/services/Shift";

import { UserModelSchema } from "@/types";

import { userMocked, userShiftsMocked } from "../../mocks";

describe("Dashboard Service", () => {
  test("should return the number of shifts", () => {
    const dashboard = new DashboardService(userMocked);

    expect(dashboard.shiftsLen).toBe(9);
  });

  test("Should Zod validate the user model", () => {
    const userParsed = UserModelSchema.parse(userMocked);

    expect(userParsed).toBeTruthy();
  });

  test("Should calculate the amount of paid for hours worked in the current week", () => {
    const dashboard = new DashboardService(userMocked);

    const expectedPaid = userShiftsMocked.reduce((acc, shift) => {
      const minuteValue = userMocked.profile?.hourlyRate / 60;

      const amount = shift?.amount ?? 0;

      if (isThisWeek(new Date(shift.startDate))) {
        return (acc + amount) * minuteValue;
      }

      return acc;
    }, 0);

    expect(dashboard.estimatedWeeklyEarnings()).toBe(expectedPaid);
  });

  test("Should return the amount of hours worked", () => {
    const dashboard = new DashboardService(userMocked);
    const total = userShiftsMocked.reduce((acc, shift) => {
      const amount = shift?.amount ?? 0;
      return acc + amount;
    }, 0);

    const expectedHours = ShiftService.convertAmountInDecimal(total);
    const dashboardWorkedHours = ShiftService.convertAmountInDecimal(
      dashboard.hoursWorked
    );

    expect(dashboardWorkedHours).toBe(expectedHours);
  });

  test("Should return the average of hours worked per day", () => {
    const dashboard = new DashboardService(userMocked);
    const expectedAverage = dashboard.hoursWorked / dashboard.shiftsLen;

    expect(dashboard.averageHoursWorkedPerDay).toBe(expectedAverage);
  });

  test("Should return the last day registered", () => {
    const dashboard = new DashboardService(userMocked);
    const expectedLastDayRegistered = max(
      userShiftsMocked.map((shift) => new Date(shift.startDate))
    ).toString();

    expect(dashboard.lastDayRegistered).toBe(expectedLastDayRegistered);
  });
});

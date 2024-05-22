import { isThisWeek, max } from "date-fns";
import { describe, expect, test } from "vitest";

import DashboardService from "@/services/Dashboard";
import ShiftService from "@/services/Shift";

import { UserModelSchema } from "@/types";

import { userMocked } from "../../mocks";

describe("Dashboard Service", () => {
  test("1. should return the number of shifts", () => {
    const dashboard = new DashboardService(userMocked);

    expect(dashboard.shiftsLen).toBe(18);
  });

  test("2. Should Zod validate the user model", () => {
    const userParsed = UserModelSchema.parse(userMocked);

    expect(userParsed).toBeTruthy();
  });

  test("3. Should calculate the amount of paid for hours worked in the current week", () => {
    const dashboard = new DashboardService(userMocked);

    const hourlyPaid =
      userMocked.shifts?.hourly.reduce((acc, shift) => {
        const earnings = new ShiftService(shift).calculateEarnings();

        if (isThisWeek(new Date(shift.startDate), { weekStartsOn: 1 })) {
          return (acc += earnings);
        }

        return acc;
      }, 0) ?? 0;

    const productionPaid =
      userMocked.shifts?.production.reduce((acc, shift) => {
        const earnings = new ShiftService(shift).calculateEarnings();

        if (isThisWeek(new Date(shift.startDate), { weekStartsOn: 1 })) {
          return (acc += earnings);
        }

        return acc;
      }, 0) ?? 0;

    expect(dashboard.estimatedWeeklyEarnings()).toBe(hourlyPaid + productionPaid);
  });

  test("4. Should return the amount of hours worked", () => {
    const dashboard = new DashboardService(userMocked);
    const production =
      userMocked.shifts?.production.reduce((acc, shift) => {
        const amount = shift?.amount ?? 0;
        return acc + amount;
      }, 0) ?? 0;

    const hourly =
      userMocked.shifts?.hourly.reduce((acc, shift) => {
        const amount = shift?.amount ?? 0;
        return acc + amount;
      }, 0) ?? 0;

    const total = production + hourly;

    const expectedHours = ShiftService.convertAmountInDecimal(total);
    const dashboardWorkedHours = ShiftService.convertAmountInDecimal(dashboard.hoursWorked);

    expect(dashboardWorkedHours).toBe(expectedHours);
  });

  test("5. Should return the average of hours worked per day", () => {
    const dashboard = new DashboardService(userMocked);
    const expectedAverage = dashboard.hoursWorked / dashboard.shiftsLen;

    expect(dashboard.averageHoursWorkedPerDay).toBe(expectedAverage);
  });

  test("6. Should return the last day registered", () => {
    const dashboard = new DashboardService(userMocked);
    const expectedLastProductionShift = max(
      userMocked.shifts?.production.map((shift) => new Date(shift.startDate)) ?? []
    );
    const expectedLastHourlyShift = max(
      userMocked.shifts?.hourly.map((shift) => new Date(shift.startDate)) ?? []
    );
    const expectedLastDayRegistered = max([
      expectedLastProductionShift,
      expectedLastHourlyShift,
    ]).toString();

    expect(dashboard.lastDayRegistered).toBe(expectedLastDayRegistered);
  });
});

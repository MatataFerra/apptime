import { isThisWeek, max } from "date-fns";
import { userMocked, userShiftsMocked } from "#/mocks";
import _ from "lodash";
import DashboardService from "@/services/Dashboard";
import UserService from "@/services/User";
import { UserModelSchema } from "@/types";
import { ShiftService } from "@/services";

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

    expect(dashboard.getPaidInWeek()).toBe(expectedPaid);
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

  test("The amount must be a decimal number", () => {
    const userService = new UserService(userMocked);
    const user = userService.transformUser(userMocked);
    const shiftMock = userShiftsMocked[0].amount!; // must be 125 minutes (2 hours and 5 minutes) difference
    const expectedDecimal = Math.round((shiftMock / 60) * 100) / 100;
    const userAmountDecimal = ShiftService.convertAmountInDecimal(
      user.shifts[0].amount!
    );

    expect(userAmountDecimal).toBe(expectedDecimal);
  });
});

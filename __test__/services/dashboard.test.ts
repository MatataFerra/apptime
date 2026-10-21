import { isThisWeek, max } from "date-fns";
import isEmpty from "lodash/isEmpty";
import { describe, expect, test } from "vitest";

import DashboardService from "@/services/Dashboard";
import ShiftService from "@/services/Shift";

import { UserModelSchema, UserType } from "@/types";

import { userMocked } from "../../mocks";

const user: UserType = {
  id: "clwil47o10000t7mdgtf1gtsv",
  email: "matias.agf@gmail.com",
  emailVerified: false,
  createdAt: new Date("2024-05-01T00:00:00Z"),
  updatedAt: new Date("2024-05-01T00:00:00Z"),
  image: "/assets/avatar.svg",
  name: "User",
  type_account: "CREDENTIALS",
  role: "ADMIN",
  online: false,
  formCompleted: false,
  isActive: true,
  shifts: {
    id: 2,
    userId: "clwil47o10000t7mdgtf1gtsv",
    hourly: [
      {
        id: 59,
        name: null,
        startDate: "Thu Aug 08 2024 10:00:00 GMT+1000 (hora estándar de Australia oriental)",
        endDate: "Thu Aug 08 2024 17:45:00 GMT+1000 (hora estándar de Australia oriental)",
        amount: 465,
        isPublicHoliday: false,
        publicHolidayWorked: false,
        isClosed: true,
        notes: "",
        hourValue: 29,
        unpaidBreaks: 1,
        shiftId: 2,
        currency: null,
        source: null,
        taxes: [],
        contributions: [],
      },
      {
        id: 60,
        name: null,
        startDate: "Fri Aug 09 2024 07:00:00 GMT+1000 (hora estándar de Australia oriental)",
        endDate: "Fri Aug 09 2024 15:30:00 GMT+1000 (hora estándar de Australia oriental)",
        amount: 510,
        isPublicHoliday: false,
        publicHolidayWorked: false,
        isClosed: true,
        notes: "",
        hourValue: 29,
        unpaidBreaks: 1,
        shiftId: 2,
        currency: null,
        source: null,
        taxes: [],
        contributions: [],
      },
      {
        id: 61,
        name: null,
        startDate: "Mon Aug 12 2024 06:00:00 GMT+1000 (hora estándar de Australia oriental)",
        endDate: "Mon Aug 12 2024 18:00:00 GMT+1000 (hora estándar de Australia oriental)",
        amount: 720,
        isPublicHoliday: false,
        publicHolidayWorked: false,
        isClosed: true,
        notes: "",
        hourValue: 29,
        unpaidBreaks: 1,
        shiftId: 2,
        currency: null,
        source: null,
        taxes: [],
        contributions: [],
      },
      {
        id: 62,
        name: null,
        startDate: "Tue Aug 13 2024 06:00:00 GMT+1000 (hora estándar de Australia oriental)",
        endDate: "Tue Aug 13 2024 18:00:00 GMT+1000 (hora estándar de Australia oriental)",
        amount: 720,
        isPublicHoliday: false,
        publicHolidayWorked: false,
        isClosed: true,
        notes: "",
        hourValue: 29,
        unpaidBreaks: 1,
        shiftId: 2,
        currency: null,
        source: null,
        taxes: [],
        contributions: [],
      },
      {
        id: 63,
        name: null,
        startDate: "Wed Aug 14 2024 06:00:00 GMT+1000 (hora estándar de Australia oriental)",
        endDate: "Wed Aug 14 2024 17:48:00 GMT+1000 (hora estándar de Australia oriental)",
        amount: 708,
        isPublicHoliday: false,
        publicHolidayWorked: false,
        isClosed: true,
        notes: "",
        hourValue: 29,
        unpaidBreaks: 1,
        shiftId: 2,
        currency: null,
        source: null,
        taxes: [],
        contributions: [],
      },
      {
        id: 64,
        name: null,
        startDate: "Thu Aug 15 2024 06:00:00 GMT+1000 (hora estándar de Australia oriental)",
        endDate: "Thu Aug 15 2024 17:53:00 GMT+1000 (hora estándar de Australia oriental)",
        amount: 713,
        isPublicHoliday: false,
        publicHolidayWorked: false,
        isClosed: true,
        notes: "",
        hourValue: 29,
        unpaidBreaks: 1,
        shiftId: 2,
        currency: null,
        source: null,
        taxes: [],
        contributions: [],
      },
      {
        id: 65,
        name: null,
        startDate: "Fri Aug 16 2024 06:00:00 GMT+1000 (hora estándar de Australia oriental)",
        endDate: "Fri Aug 16 2024 17:40:00 GMT+1000 (hora estándar de Australia oriental)",
        amount: 700,
        isPublicHoliday: false,
        publicHolidayWorked: false,
        isClosed: true,
        notes: "",
        hourValue: 29,
        unpaidBreaks: 1,
        shiftId: 2,
        currency: null,
        source: null,
        taxes: [],
        contributions: [],
      },
      {
        id: 68,
        name: null,
        startDate: "Mon Aug 19 2024 06:00:00 GMT+1000 (hora estándar de Australia oriental)",
        endDate: "Mon Aug 19 2024 18:00:00 GMT+1000 (hora estándar de Australia oriental)",
        amount: 720,
        isPublicHoliday: false,
        publicHolidayWorked: false,
        isClosed: true,
        notes: "",
        hourValue: 29,
        unpaidBreaks: 1,
        shiftId: 2,
        currency: null,
        source: null,
        taxes: [],
        contributions: [],
      },
      {
        id: 69,
        name: null,
        startDate: "Tue Aug 20 2024 06:30:00 GMT+1000 (hora estándar de Australia oriental)",
        endDate: "Tue Aug 20 2024 18:00:00 GMT+1000 (hora estándar de Australia oriental)",
        amount: 690,
        isPublicHoliday: false,
        publicHolidayWorked: false,
        isClosed: true,
        notes: "",
        hourValue: 29,
        unpaidBreaks: 1,
        shiftId: 2,
        currency: null,
        source: null,
        taxes: [],
        contributions: [],
      },
      {
        id: 72,
        name: null,
        startDate: "Wed Aug 21 2024 06:00:00 GMT+1000 (hora estándar de Australia oriental)",
        endDate: "Wed Aug 21 2024 17:56:00 GMT+1000 (hora estándar de Australia oriental)",
        amount: 716,
        isPublicHoliday: false,
        publicHolidayWorked: false,
        isClosed: true,
        notes: "",
        hourValue: 29.33,
        unpaidBreaks: 30,
        shiftId: 2,
        currency: null,
        source: null,
        taxes: [],
        contributions: [],
      },
      {
        id: 73,
        name: "Nutrano",
        startDate: "Thu Aug 22 2024 06:00:00 GMT+1000 (hora estándar de Australia oriental)",
        endDate: "Thu Aug 22 2024 18:11:00 GMT+1000 (hora estándar de Australia oriental)",
        amount: 731,
        isPublicHoliday: false,
        publicHolidayWorked: false,
        isClosed: true,
        notes: "",
        hourValue: 29.33,
        unpaidBreaks: 30,
        shiftId: 2,
        currency: null,
        source: null,
        taxes: [],
        contributions: [],
      },
      {
        id: 74,
        name: "Nutrano",
        startDate: "Fri Aug 23 2024 06:00:00 GMT+1000 (hora estándar de Australia oriental)",
        endDate: "Fri Aug 23 2024 18:13:00 GMT+1000 (hora estándar de Australia oriental)",
        amount: 733,
        isPublicHoliday: false,
        publicHolidayWorked: false,
        isClosed: true,
        notes: "",
        hourValue: 29.33,
        unpaidBreaks: 30,
        shiftId: 2,
        currency: null,
        source: null,
        taxes: [],
        contributions: [],
      },
      {
        id: 76,
        name: "Nutrano",
        startDate: "Mon Aug 26 2024 06:00:00 GMT+1000 (hora estándar de Australia oriental)",
        endDate: "Mon Aug 26 2024 18:00:00 GMT+1000 (hora estándar de Australia oriental)",
        amount: 720,
        isPublicHoliday: false,
        publicHolidayWorked: false,
        isClosed: true,
        notes: "",
        hourValue: 29.33,
        unpaidBreaks: 30,
        shiftId: 2,
        currency: null,
        source: null,
        taxes: [],
        contributions: [],
      },
      {
        id: 77,
        name: "Nutrano",
        startDate: "Tue Aug 27 2024 06:00:00 GMT+1000 (hora estándar de Australia oriental)",
        endDate: "Tue Aug 27 2024 18:00:00 GMT+1000 (hora estándar de Australia oriental)",
        amount: 720,
        isPublicHoliday: false,
        publicHolidayWorked: false,
        isClosed: true,
        notes: "",
        hourValue: 29.33,
        unpaidBreaks: 30,
        shiftId: 2,
        currency: null,
        source: null,
        taxes: [],
        contributions: [],
      },
      {
        id: 78,
        name: "Nutrano",
        startDate: "Wed Aug 28 2024 06:00:00 GMT+1000 (hora estándar de Australia oriental)",
        endDate: "Wed Aug 28 2024 17:47:00 GMT+1000 (hora estándar de Australia oriental)",
        amount: 707,
        isPublicHoliday: false,
        publicHolidayWorked: false,
        isClosed: true,
        notes: "",
        hourValue: 29.33,
        unpaidBreaks: 30,
        shiftId: 2,
        currency: null,
        source: null,
        taxes: [],
        contributions: [],
      },
      {
        id: 79,
        name: "Nutrano",
        startDate: "Thu Aug 29 2024 06:00:00 GMT+1000 (hora estándar de Australia oriental)",
        endDate: "Thu Aug 29 2024 18:00:00 GMT+1000 (hora estándar de Australia oriental)",
        amount: 720,
        isPublicHoliday: false,
        publicHolidayWorked: false,
        isClosed: true,
        notes: "",
        hourValue: 29.33,
        unpaidBreaks: 30,
        shiftId: 2,
        currency: null,
        source: null,
        taxes: [],
        contributions: [],
      },
      {
        id: 80,
        name: "Nutrano",
        startDate: "Fri Aug 30 2024 06:01:00 GMT+1000 (hora estándar de Australia oriental)",
        endDate: "Fri Aug 30 2024 17:32:00 GMT+1000 (hora estándar de Australia oriental)",
        amount: 691,
        isPublicHoliday: false,
        publicHolidayWorked: false,
        isClosed: true,
        notes: "",
        hourValue: 29.33,
        unpaidBreaks: 30,
        shiftId: 2,
        currency: null,
        source: null,
        taxes: [],
        contributions: [],
      },
      {
        id: 81,
        name: "Nutrano",
        startDate: "Mon Sep 02 2024 06:00:00 GMT+1000 (hora estándar de Australia oriental)",
        endDate: "Mon Sep 02 2024 18:00:00 GMT+1000 (hora estándar de Australia oriental)",
        amount: 720,
        isPublicHoliday: false,
        publicHolidayWorked: false,
        isClosed: true,
        notes: "",
        hourValue: 29.33,
        unpaidBreaks: 30,
        shiftId: 2,
        currency: null,
        source: null,
        taxes: [],
        contributions: [],
      },
      {
        id: 82,
        name: "Nutrano",
        startDate: "Tue Sep 03 2024 06:00:00 GMT+1000 (hora estándar de Australia oriental)",
        endDate: "Tue Sep 03 2024 17:53:00 GMT+1000 (hora estándar de Australia oriental)",
        amount: 713,
        isPublicHoliday: false,
        publicHolidayWorked: false,
        isClosed: true,
        notes: "",
        hourValue: 29.33,
        unpaidBreaks: 30,
        shiftId: 2,
        currency: null,
        source: null,
        taxes: [],
        contributions: [],
      },
      {
        id: 83,
        name: "Nutrano",
        startDate: "Wed Sep 04 2024 06:00:00 GMT+1000 (hora estándar de Australia oriental)",
        endDate: "Wed Sep 04 2024 18:12:00 GMT+1000 (hora estándar de Australia oriental)",
        amount: 732,
        isPublicHoliday: false,
        publicHolidayWorked: false,
        isClosed: true,
        notes: "",
        hourValue: 29.33,
        unpaidBreaks: 30,
        shiftId: 2,
        currency: null,
        source: null,
        taxes: [],
        contributions: [],
      },
      {
        id: 84,
        name: "Nutrano",
        startDate: "Thu Sep 05 2024 06:00:00 GMT+1000 (hora estándar de Australia oriental)",
        endDate: "Thu Sep 05 2024 17:52:00 GMT+1000 (hora estándar de Australia oriental)",
        amount: 712,
        isPublicHoliday: false,
        publicHolidayWorked: false,
        isClosed: true,
        notes: "",
        hourValue: 29.33,
        unpaidBreaks: 30,
        shiftId: 2,
        currency: null,
        source: null,
        taxes: [],
        contributions: [],
      },
      {
        id: 85,
        name: "Nutrano",
        startDate: "Fri Sep 06 2024 06:00:00 GMT+1000 (hora estándar de Australia oriental)",
        endDate: "Fri Sep 06 2024 17:28:00 GMT+1000 (hora estándar de Australia oriental)",
        amount: 688,
        isPublicHoliday: false,
        publicHolidayWorked: false,
        isClosed: true,
        notes: "",
        hourValue: 29.33,
        unpaidBreaks: 30,
        shiftId: 2,
        currency: null,
        source: null,
        taxes: [],
        contributions: [],
      },
    ],
    production: [],
  },
  profile: null,
  config: null,
};

describe("Dashboard Service", () => {
  test("1. should return the number of shifts", () => {
    const dashboard = new DashboardService(
      userMocked.shifts!.hourly,
      userMocked.shifts!.production
    );

    expect(dashboard.shiftsLen).toBe(18);
  });

  test("2. Should Zod validate the user model", () => {
    const userParsed = UserModelSchema.parse(userMocked);

    expect(userParsed).toBeTruthy();
  });

  test("3. Should calculate the amount of paid for hours worked in the current week", () => {
    const dashboard = new DashboardService(
      userMocked.shifts!.hourly,
      userMocked.shifts!.production
    );

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
    const dashboard = new DashboardService(
      userMocked.shifts!.hourly,
      userMocked.shifts!.production
    );
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
    const dashboard = new DashboardService(
      userMocked.shifts!.hourly,
      userMocked.shifts!.production
    );
    const expectedAverage = dashboard.hoursWorked / dashboard.shiftsLen;

    expect(dashboard.averageHoursWorkedPerDay).toBe(expectedAverage);
  });

  test("6. Should return the last day registered", () => {
    const dashboard = new DashboardService(
      userMocked.shifts!.hourly,
      userMocked.shifts!.production
    );

    if (isEmpty(user.shifts?.production)) {
      const expectedLastHourlyShift = max(
        user.shifts?.hourly.map((shift) => new Date(shift.startDate)) ?? []
      );
      const expectedLastDayRegistered = max([expectedLastHourlyShift]).toString();

      return expect(dashboard.lastDayRegistered).toBe(expectedLastDayRegistered);
    }

    if (isEmpty(user.shifts?.hourly)) {
      const expectedLastHourlyShift = max(
        user.shifts?.production.map((shift) => new Date(shift.startDate)) ?? []
      );
      const expectedLastDayRegistered = max([expectedLastHourlyShift]).toString();

      return expect(dashboard.lastDayRegistered).toBe(expectedLastDayRegistered);
    }

    const expectedLastProductionShift = max(
      user.shifts?.production.map((shift) => new Date(shift?.startDate)) ?? []
    );

    const expectedLastHourlyShift = max(
      user.shifts?.hourly.map((shift) => new Date(shift.startDate)) ?? []
    );
    const expectedLastDayRegistered = max([
      expectedLastProductionShift,
      expectedLastHourlyShift,
    ]).toString();

    expect(dashboard.lastDayRegistered).toBe(expectedLastDayRegistered);
  });
});

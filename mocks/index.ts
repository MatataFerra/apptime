import { Profile, User } from "@prisma/client";
import { addDays, addHours, addMinutes, differenceInMinutes } from "date-fns";

import type { Shifts, UserType } from "@/types";

/** A user fixture with both shift lists loaded (getSessionUser with shifts). */
type UserWithShifts = UserType & { shifts: Shifts };

import { generateRandomID } from "@/utils/helpers/generateRandomID";

import profileMock from "../mocks/profile.prisma.json";
import userMock from "../mocks/user.prisma.json";

/**
 * Now date for testing the dashboard service
 * @example Mon May 29 2023 13:18:42 GMT+1200 (hora estándar de Nueva Zelanda)
 */
export const now = new Date("2023-05-29T01:18:42.494Z");
export const real = new Date(Date.now());

/**
 * @summary Dates mock for testing the dashboard service
 *
 * The week starts on Sunday. The codes are 0, 1, 2, 3, 4, 5, 6
 *
 * If it now was Monday, the dates would be:
 * - Monday (today)
 * - Sunday (yesterday)
 * - Saturday (one day before yesterday)
 * - Tuesday (tomorrow)
 * - Wednesday (one day after tomorrow)
 * - Monday from the last week
 * - Sunday from the last week
 * - Monday from the next week
 * - Tuesday from the next week
 *
 *
 * Valid dates for testing the dashboard service
 * |Day|  index|
 * |---|-------|
 * |Monday| 0 |
 * |Sunday| 1 |
 * |Tuesday| 3 |
 * |Wednesday| 4 |
 *
 */
export const datesMock = [
  real, // today
  addDays(real, -1), // yesterday
  addDays(real, -2), // one day before yesterday
  addDays(real, 1), // tomorrow
  addDays(real, 2), // one day after tomorrow
  addDays(real, 3), // one day after one week after
  addDays(real, 4), // one week after
  addDays(real, 5), // one week before
  addDays(real, -8), // one day before one week before
];

export const userMockedParsed: User = {
  ...userMock.userOne,
  emailVerified: true,
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-01T00:00:00Z"),
  type_account: "CREDENTIALS",
  role: "USER",
  id: generateRandomID("uuid"),
};

export const userShiftsMocked: Shifts = {
  id: 1,
  userId: userMockedParsed.id,
  production: datesMock.map((date, i) => ({
    startDate: date.toString(),
    endDate: addMinutes(date, 125 + i).toString(),
    name: "Seasonal work in farm",
    itemValue: 10,
    itemQuantity: 10,
    taxCode: 0,
    amount: 125 + i,
    isClosed: false,
    id: i + 1,
    isPublicHoliday: false,
    notes: "",
    publicHolidayWorked: false,
    holidayRate: null,
    shiftId: 1,
    currency: null,
    employerId: null,
  })),
  hourly: datesMock.map((date, i) => ({
    startDate: date.toString(),
    name: "Permanent work in factory",
    endDate: addMinutes(date, 125 + i).toString(),
    hourValue: 10,
    taxCode: 0,
    amount: 125 + i,
    isClosed: false,
    id: i + 1,
    isPublicHoliday: false,
    notes: "",
    publicHolidayWorked: false,
    holidayRate: null,
    unpaidBreaks: 0,
    shiftId: 1,
    currency: null,
    employerId: null,
    source: null,
  })),
};

export const profileParsed: Profile = {
  ...profileMock.profile,
  userId: userMockedParsed.id,
};

export const userMocked: UserWithShifts = {
  ...userMockedParsed,
  shifts: {
    ...userShiftsMocked,
  },
  profile: profileParsed,
  config: {
    id: 1,
    userId: userMockedParsed.id,
    weekStartsOn: "sunday",
    currency: "USD",
    hourValue: null,
    unpaidBreaks: null,
    theme: "system",
    holidayRate: 1.5,
    roundMinutes: 0,
    defaultEmployerId: null,
    itemValue: null,
    earningsGoal: null,
    goalPeriod: "week",
  },
};

export const userTestData: UserWithShifts = {
  id: "user-123",
  email: "testuser@example.com",
  emailVerified: true,
  createdAt: new Date("2024-08-01T12:00:00Z"),
  updatedAt: new Date("2024-08-01T12:00:00Z"),
  image: "http://example.com/image.jpg",
  name: "Test User",
  type_account: "standard",
  role: "employee",
  online: true,
  formCompleted: true,
  isActive: true,
  config: {
    id: 1,
    weekStartsOn: "Monday",
    userId: "user-123",
    currency: "USD",
    hourValue: null,
    unpaidBreaks: null,
    theme: "system",
    holidayRate: 1.5,
    roundMinutes: 0,
    defaultEmployerId: null,
    itemValue: null,
    earningsGoal: null,
    goalPeriod: "week",
  },
  shifts: {
    id: 1,
    userId: "user-123",
    production: [
      {
        id: 1,
        name: "Seasonal work in farm",
        startDate: new Date(Date.now()).toString(),
        endDate: addHours(new Date(Date.now()), 6).toString(),
        amount: differenceInMinutes(addHours(new Date(Date.now()), 6), new Date(Date.now())),
        isPublicHoliday: false,
        publicHolidayWorked: false,
        holidayRate: null,
        isClosed: false,
        notes: "Production shift note",
        itemValue: 50,
        itemQuantity: 40,
        shiftId: 1001,
        currency: null,
        employerId: null,
        taxes: [
          {
            id: 1,
            name: "VAT",
            value: 10,
            description: "Value-added tax",
            archived: false,
            userId: null,
          },
          {
            id: 2,
            name: "Income Tax",
            value: 15,
            description: "Income tax",
            archived: false,
            userId: null,
          },
        ],
        contributions: [
          {
            id: 1,
            name: "Social Security",
            value: 5,
            description: "Social Security contribution",
            archived: false,
            userId: null,
          },
          {
            id: 2,
            name: "Health Insurance",
            value: 7,
            description: "Health insurance contribution",
            archived: false,
            userId: null,
          },
        ],
      },
    ],
    hourly: [
      {
        id: 2,
        name: "Permanent work in factory",
        startDate: new Date(Date.now()).toString(),
        endDate: addHours(new Date(Date.now()), 8).toString(),
        amount: differenceInMinutes(addHours(new Date(Date.now()), 8), new Date(Date.now())),
        isPublicHoliday: false,
        publicHolidayWorked: false,
        holidayRate: null,
        isClosed: false,
        notes: "Hourly shift note",
        hourValue: 30,
        unpaidBreaks: 1,
        shiftId: 1002,
        currency: null,
        employerId: null,
        source: null,
        taxes: [
          {
            id: 3,
            name: "State Tax",
            value: 8,
            description: "State tax",
            archived: false,
            userId: null,
          },
          {
            id: 4,
            name: "Federal Tax",
            value: 12,
            description: "Federal tax",
            archived: false,
            userId: null,
          },
        ],
        contributions: [
          {
            id: 3,
            name: "Pension Fund",
            value: 4,
            description: "Pension fund contribution",
            archived: false,
            userId: null,
          },
        ],
      },
    ],
  },
  profile: {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    address: "123 Main St",
    city: "Metropolis",
    country: "Countryland",
    userId: "user-123",
  },
};

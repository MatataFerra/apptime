import { Profile, User } from "@prisma/client";
import { addDays, addMinutes } from "date-fns";

import { UserType } from "@/types";

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
  emailVerified: new Date(userMock.userOne.emailVerified),
  type_account: "CREDENTIALS",
  role: "USER",
  id: generateRandomID("uuid"),
};

export const userShiftsMocked: UserType["shifts"] = {
  id: 1,
  userId: userMockedParsed.id,
  production: datesMock.map((date, i) => ({
    startDate: date.toString(),
    endDate: addMinutes(date, 125 + i).toString(),
    itemValue: 10,
    itemQuantity: 10,
    holidayPay: true,
    holidayPayRate: 0,
    taxCode: 0,
    amount: 125 + i,
    isClosed: false,
    id: i + 1,
    isPublicHoliday: false,
    notes: "",
    publicHolidayWorked: false,
    shiftId: 1,
  })),
  hourly: datesMock.map((date, i) => ({
    startDate: date.toString(),
    endDate: addMinutes(date, 125 + i).toString(),
    hourValue: 10,
    holidayPay: true,
    holidayPayRate: 0,
    taxCode: 0,
    amount: 125 + i,
    isClosed: false,
    id: i + 1,
    isPublicHoliday: false,
    notes: "",
    publicHolidayWorked: false,
    unpaidBreaks: 0,
    shiftId: 1,
  })),
};

export const profileParsed: Profile = {
  ...profileMock.profile,
  userId: userMockedParsed.id,
};

export const userMocked: UserType = {
  ...userMockedParsed,
  shifts: {
    ...userShiftsMocked,
  },
  profile: profileParsed,
  config: {
    id: 1,
    userId: userMockedParsed.id,
    weekStartsOn: "sunday",
  },
};

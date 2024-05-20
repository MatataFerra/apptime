import { Hourly, Production, Profile, Shift, User } from "@prisma/client";
import { addDays, addMinutes, differenceInMinutes } from "date-fns";

import { UserType } from "@/types";

import { generateRandomID } from "@/utils/helpers/generateRandomID";

import profileMock from "../mocks/profile.prisma.json";
import userMock from "../mocks/user.prisma.json";

/**
 * Now date for testing the dashboard service
 * @example Mon May 29 2023 13:18:42 GMT+1200 (hora estándar de Nueva Zelanda)
 */
export const now = new Date("2023-05-29T01:18:42.494Z");

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
  now, // today
  addDays(now, -1), // yesterday
  addDays(now, -2), // one day before yesterday
  addDays(now, 1), // tomorrow
  addDays(now, 2), // one day after tomorrow
  addDays(now, 8), // one day after one week after
  addDays(now, 7), // one week after
  addDays(now, -7), // one week before
  addDays(now, -8), // one day before one week before
];

export const userMockedParsed: User = {
  ...userMock.userOne,
  emailVerified: new Date(userMock.userOne.emailVerified),
  type_account: "CREDENTIALS",
  role: "USER",
  id: generateRandomID("uuid"),
};

export const userShiftsMocked: Shift[] = datesMock.map((date, i) => {
  const shift: UserType["shifts"] = {
    id: i,
    userId: userMockedParsed.id,
    productions: [],
    hourlies: [],
  };
  const production: Production = {
    startDate: date.toString(),
    endDate: addMinutes(date, 125).toString(),
    itemValue: 10,
    itemQuantity: 10,
    holidayPay: true,
    holidayPayRate: 0,
    taxCode: 0,
    amount: 0,
    isClosed: false,
    id: i + 1,
    isPublicHoliday: false,
    notes: "",
    publicHolidayWorked: false,
    shiftId: shift.id,
  };

  const hourly: Hourly = {
    startDate: date.toString(),
    endDate: addMinutes(date, 125).toString(),
    hourValue: 10,
    holidayPay: true,
    holidayPayRate: 0,
    taxCode: 0,
    amount: 0,
    isClosed: false,
    id: i + 1,
    isPublicHoliday: false,
    notes: "",
    publicHolidayWorked: false,
    unpaidBreaks: 0,
    shiftId: shift.id,
  };

  shift.productions.push(production);
  shift.hourlies.push(hourly);

  return shift;
});

export const profileParsed: Profile = {
  ...profileMock.profile,
  userId: userMockedParsed.id,
};

export const userMocked = {
  ...userMockedParsed,
  shifts: userShiftsMocked,
  profile: profileParsed,
};

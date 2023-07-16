import ShiftService from "@/services/Shift";
import shiftMock from "#/mocks/shift.prisma.json";
import profileMock from "#/mocks/profile.prisma.json";
import { Shift } from "@prisma/client";
import { now } from "@/utils/constants";
import { addMinutes } from "date-fns";

const DIFFERENCE_SHIFT = 480;
const start = new Date(now).toString();
const end = addMinutes(new Date(now), DIFFERENCE_SHIFT).toString();

describe("ShiftService", () => {
  test("should return the difference between the start and end of a shift", () => {
    const mock: Shift = {
      ...shiftMock.shift,
      startDate: start,
      endDate: end,
    };

    const shift = new ShiftService(mock)
      .differenceInMinsBetweenStartAndEnd()
      .build();

    expect(shift.amount).toBe(480);
  });

  test("should calculate the holiday pay when was not worked", () => {
    const mock: Shift = {
      ...shiftMock.shift,
      startDate: start,
      endDate: end,
      isHoliday: true,
    };

    /* 
      inputs: 
      hourlyRate: 10.5
      holidayPayRate: 1 (because is not worked)
      amount of minutes worked: 480

      First we need to convert from hour to minutes: 10.5 / 60 = 0.175 each minute


      Total: 0.175 * 480 = 84
    */

    const shift = new ShiftService(mock)
      .differenceInMinsBetweenStartAndEnd()
      .build();

    const publicHoliday = new ShiftService(shift).publicHolidayPay(
      profileMock.profile
    );

    expect(publicHoliday).toBe(84);
  });

  test("should calculate the holiday pay when was worked", async () => {
    const mock: Shift = {
      ...shiftMock.shift,
      startDate: start,
      endDate: end,
      isHoliday: true,
      holidayWorked: true,
    };

    /* 
      inputs: 
      hourlyRate: 10.5
      holidayPayRate: 1.5 (because is worked)
      amount of minutes worked: 480

      First we need to convert from hour to minutes: 10.5 / 60 = 0.175 each minute


      Total: 0.175 * 480 = 84 -> 84 * 1.5 = 126
    */

    const shift = new ShiftService(mock)
      .differenceInMinsBetweenStartAndEnd()
      .build();

    const publicHoliday = new ShiftService(shift).publicHolidayPay(
      profileMock.profile
    );

    expect(publicHoliday).toBe(126);
  });
});

import { Shift } from "@prisma/client";
import { addDays, addMinutes } from "date-fns";
import { cloneDeep } from "lodash";
import { describe, expect, test } from "vitest";

import PayService from "@/services/Pay";
import ShiftService from "@/services/Shift";

import { now } from "@/utils/constants";

import profileMock from "../../mocks/profile.prisma.json";
import shiftMock from "../../mocks/shift.prisma.json";

const DIFFERENCE_SHIFT = 30;
// let start = "";
// let end = "";

// let SHIFT_MOCK: any = {};

describe("ShiftService", () => {
  describe("Check if shift builds correctly", () => {
    let start = addMinutes(now, -DIFFERENCE_SHIFT).toString();

    const SHIFT_MOCK = {
      ...shiftMock.shift,
      startDate: start,
      endDate: null,
    };
    test("should return the same shift", () => {
      const shift = new ShiftService(SHIFT_MOCK).build();

      expect(shift).toEqual(SHIFT_MOCK);
    });

    test("endData should be null", () => {
      const shift = new ShiftService(SHIFT_MOCK).build();

      expect(shift.endDate).toBeNull();
    });

    test("should return the same shift with the updated status and the endDate updated", () => {
      const shift = new ShiftService({ ...SHIFT_MOCK, endDate: now.toString() })
        .closeShift()
        .build();
      const deepCopy = cloneDeep(SHIFT_MOCK);
      const merge_isClosed = { ...deepCopy, isClosed: true, endDate: now.toString() };

      expect(shift).toEqual(merge_isClosed);
    });

    test("should return the shift with all transformations", () => {
      const shift = new ShiftService({ ...SHIFT_MOCK, isClosed: true })
        .closeShift()
        .checkPublicHoliday()
        .differenceInMinsBetweenStartAndEnd()
        .build();

      expect(shift).toEqual<Shift>({
        id: SHIFT_MOCK.id,
        startDate: start,
        isPublicHoliday: false,
        notes: SHIFT_MOCK.notes,
        publicHolidayWorked: false,
        userId: SHIFT_MOCK.userId,
        isClosed: true,
        endDate: now.toString(),
        amount: DIFFERENCE_SHIFT,
        holidayPay: true,
        holidayPayRate: 8,
        hourValue: 10.5,
        taxCode: 0,
        unpaidBreaks: 1,
      });
    });

    test("should return the endDate with different value", () => {
      const shift = new ShiftService({
        ...shiftMock.shift,
        startDate: start,
        endDate: addDays(now, 1).toString(),
      })
        .closeShift()
        .build();

      expect(shift.endDate).not.toBe(SHIFT_MOCK.endDate);
      expect(shift.endDate).toBe(addDays(now, 1).toString());
      expect(shift.endDate).not.toBe(now.toString());
      expect(SHIFT_MOCK.endDate).toBeNull();
    });
  });

  describe("Should check if service and pay service works correctly", () => {
    let start = now.toString();
    let end = addMinutes(now, DIFFERENCE_SHIFT).toString();

    let SHIFT_MOCK: Shift = {
      ...shiftMock.shift,
      startDate: start,
      endDate: end,
    };

    test("should return the difference between the start and end of a shift", () => {
      const mock: Shift = {
        ...SHIFT_MOCK,
      };

      const shift = new ShiftService(mock).differenceInMinsBetweenStartAndEnd().build();

      expect(shift.amount).toBe(30);
    });

    test("should calculate the holiday pay when was not worked", () => {
      const mock: Shift = {
        ...SHIFT_MOCK,
        isPublicHoliday: true,
      };

      /* 
        inputs: 
        hourlyRate: 10.5
        holidayPayRate: 1 (because is not worked)
        amount of minutes worked: DIFFERENCE_SHIFT
  
        First we need to convert from hour to minutes: 10.5 / 60 = 0.175 each minute
  
  
        Total: 0.175 * DIFFERENCE_SHIFT = TOTAL
      */

      const shift = new ShiftService(mock)
        .differenceInMinsBetweenStartAndEnd()
        .checkPublicHoliday()
        .build() as Shift;

      const publicHoliday = PayService.publicHolidayPay({
        shift,
      });

      expect(publicHoliday).toBe(5.25);
    });

    test("should calculate the holiday pay when was worked", async () => {
      const mock: Shift = {
        ...SHIFT_MOCK,
        startDate: start,
        endDate: end,
        isPublicHoliday: true,
        publicHolidayWorked: true,
      };

      /* 
        inputs: 
        hourlyRate: 10.5
        holidayPayRate: 1.5 (because is worked)
        amount of minutes worked: DIFFERENCE_SHIFT
  
        First we need to convert from hour to minutes: 10.5 / 60 = 0.175 each minute
  
  
        Total: 0.175 * DIFFERENCE_SHIFT = SUB_TOTAL -> SUB_TOTAL * 1.5 = TOTAL
      */

      const shift = new ShiftService(mock)
        .checkPublicHoliday()
        .differenceInMinsBetweenStartAndEnd()
        .closeShift()
        .build() as Shift;

      const publicHoliday = PayService.publicHolidayPay({
        shift,
      });

      expect(publicHoliday).toBe(7.875);
    });

    test("Should change the status of the shift to closed", () => {
      const mock: Shift = {
        ...SHIFT_MOCK,
        startDate: start,
        endDate: end,
        isClosed: false,
      };

      const shift = new ShiftService(mock).closeShift().build();

      expect(shift.isClosed).toBe(true);
    });
  });

  describe("Should calculate earnings", () => {
    test("Should calculate the earnings of a shift", () => {
      const mock: Shift = {
        ...shiftMock.shift,
        startDate: now.toString(),
        endDate: addMinutes(now, DIFFERENCE_SHIFT).toString(),
      };

      const shift = new ShiftService(mock).differenceInMinsBetweenStartAndEnd().build();

      const earnings = ShiftService.calculateEarnings({ shift });

      expect(earnings).toBe(5.25);
    });

    test("Should calculate the earnings of a shift when is public holiday", () => {
      const mock: Shift = {
        ...shiftMock.shift,
        startDate: now.toString(),
        endDate: addMinutes(now, DIFFERENCE_SHIFT).toString(),
        isPublicHoliday: true,
      };

      const shift = new ShiftService(mock).differenceInMinsBetweenStartAndEnd().build();

      const earnings = ShiftService.calculateEarnings({
        shift,
      });

      expect(earnings).toBe(7.88);
    });

    test("Should calculate the earnings when user pass start and end dates instead shift", () => {
      const start = now.toString();
      const end = addMinutes(now, DIFFERENCE_SHIFT).toString();
      const {
        holidayPay,
        holidayPayRate,
        hourValue,
        isClosed,
        isPublicHoliday,
        notes,
        publicHolidayWorked,
        taxCode,
        unpaidBreaks,
        userId,
      } = shiftMock.shift;

      const earnings = ShiftService.calculateEarnings({
        shift: {
          amount: DIFFERENCE_SHIFT,
          holidayPay,
          holidayPayRate,
          hourValue,
          isClosed,
          endDate: end,
          isPublicHoliday: false,
          notes,
          publicHolidayWorked,
          startDate: start,
          taxCode,
          unpaidBreaks,
          userId,
        },
      });

      expect(earnings).toBe(5.25);
    });

    test("Should calculate the earnings when user pass start and end dates instead shift and is public holiday", () => {
      const start = now.toString();
      const end = addMinutes(now, DIFFERENCE_SHIFT).toString();
      const {
        holidayPay,
        holidayPayRate,
        hourValue,
        isClosed,
        isPublicHoliday,
        notes,
        publicHolidayWorked,
        taxCode,
        unpaidBreaks,
        userId,
      } = shiftMock.shift;

      const earnings = ShiftService.calculateEarnings({
        shift: {
          amount: DIFFERENCE_SHIFT,
          holidayPay,
          holidayPayRate,
          hourValue,
          isClosed,
          endDate: end,
          isPublicHoliday: true,
          notes,
          publicHolidayWorked,
          startDate: start,
          taxCode,
          unpaidBreaks,
          userId,
        },
      });

      expect(earnings).toBe(7.88);
    });
  });
});

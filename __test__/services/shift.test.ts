import { Hourly, Production, Shift } from "@prisma/client";
import { addDays, addMinutes } from "date-fns";
import cloneDeep from "lodash/cloneDeep";
import { describe, expect, test } from "vitest";

import ShiftService from "@/services/Shift";

import { TypeShift } from "@/types";

import { now } from "@/utils/constants";

import shiftMock from "../../mocks/shift.prisma.json";

const DIFFERENCE_SHIFT = 300;

describe("ShiftService", () => {
  describe("Check if shift builds correctly", () => {
    let start = addMinutes(now, -DIFFERENCE_SHIFT).toString();

    const PRODUCTION_SHIFT_MOCK: Production = {
      startDate: start,
      endDate: null,
      itemValue: 10,
      itemQuantity: 10,
      holidayPay: true,
      holidayPayRate: 0,
      taxCode: 0,
      amount: 0,
      isClosed: false,
      id: 1,
      isPublicHoliday: false,
      notes: "",
      publicHolidayWorked: false,
      shiftId: 1,
    };

    const HOURLY_SHIFT_MOCK: Hourly = {
      startDate: start,
      endDate: null,
      hourValue: 10,
      holidayPay: true,
      holidayPayRate: 0,
      taxCode: 0,
      amount: 0,
      isClosed: false,
      id: 1,
      isPublicHoliday: false,
      notes: "",
      publicHolidayWorked: false,
      unpaidBreaks: 0,
      shiftId: 1,
    };

    test("should return the same production shift", () => {
      const shift = new ShiftService(PRODUCTION_SHIFT_MOCK).build();

      expect(shift).toEqual(PRODUCTION_SHIFT_MOCK);
    });

    test("should return the same hourly shift", () => {
      const shift = new ShiftService(HOURLY_SHIFT_MOCK).build();

      expect(shift).toEqual(HOURLY_SHIFT_MOCK);
    });

    test("endData should be null", () => {
      const shift = new ShiftService(HOURLY_SHIFT_MOCK).build();

      expect(shift.endDate).toBeNull();
    });

    test("should return the same shift with the updated status and the endDate updated", () => {
      const shift = new ShiftService({ ...HOURLY_SHIFT_MOCK, endDate: now.toString() })
        .closeShift()
        .build();
      const deepCopy = cloneDeep(HOURLY_SHIFT_MOCK);
      const merge_isClosed = { ...deepCopy, isClosed: true, endDate: now.toString() };

      expect(shift).toEqual(merge_isClosed);
    });

    test("should return the shift with all transformations", () => {
      const shift = new ShiftService({ ...HOURLY_SHIFT_MOCK, isClosed: true })
        .closeShift()
        .checkPublicHoliday()
        .differenceInMinsBetweenStartAndEnd()
        .build();

      expect(shift).toEqual<Hourly>({
        id: HOURLY_SHIFT_MOCK.id,
        startDate: start,
        isPublicHoliday: false,
        notes: HOURLY_SHIFT_MOCK.notes,
        publicHolidayWorked: false,
        isClosed: true,
        endDate: now.toString(),
        amount: DIFFERENCE_SHIFT,
        holidayPay: true,
        holidayPayRate: 0,
        hourValue: 10,
        taxCode: 0,
        unpaidBreaks: 0,
        shiftId: 1,
      });
    });

    test("should return the endDate with different value", () => {
      const shift = new ShiftService({
        ...HOURLY_SHIFT_MOCK,
        startDate: start,
        endDate: addDays(now, 1).toString(),
      })
        .closeShift()
        .build();

      expect(shift.endDate).not.toBe(HOURLY_SHIFT_MOCK.endDate);
      expect(shift.endDate).toBe(addDays(now, 1).toString());
      expect(shift.endDate).not.toBe(now.toString());
      expect(HOURLY_SHIFT_MOCK.endDate).toBeNull();
    });

    test("should build a production shift", () => {
      const shift = new ShiftService({
        ...PRODUCTION_SHIFT_MOCK,
        startDate: start,
        endDate: addDays(now, 1).toString(),
        itemValue: 10,
        itemQuantity: 10,
      })
        .closeShift()
        .build<Production>();

      expect(shift.itemValue).toBe(10);
      expect(shift.itemQuantity).toBe(10);
    });
  });

  describe("Should calculate earnings", () => {
    test("Should calculate the earnings of a shift", () => {
      const mock = {
        ...shiftMock.shift,
        shiftId: 1,
        startDate: now.toString(),
        endDate: addMinutes(now, DIFFERENCE_SHIFT).toString(),
      };

      const shift = new ShiftService({ ...mock }).differenceInMinsBetweenStartAndEnd().build();

      const earnings = new ShiftService(shift).calculateEarnings();

      expect(earnings).toBe(50);
    });

    test("Should calculate the earnings of a shift with 2 unpaid breaks", () => {
      const mock = {
        ...shiftMock.shift,
        startDate: now.toString(),
        endDate: addMinutes(now, 480).toString(),
        unpaidBreaks: 2,
        shiftId: 1,
      };

      const shift = new ShiftService({ ...mock }).differenceInMinsBetweenStartAndEnd().build();

      const earnings = new ShiftService(shift).calculateEarnings();

      expect(earnings).toBe(70);
    });

    test("Should calculate the earnings of a shift when is public holiday", () => {
      const mock = {
        ...shiftMock.shift,
        startDate: now.toString(),
        endDate: addMinutes(now, DIFFERENCE_SHIFT).toString(),
        isPublicHoliday: true,
        publicHolidayWorked: true,
        shiftId: 1,
      };

      const shift = new ShiftService({ ...mock }).differenceInMinsBetweenStartAndEnd().build();

      const earnings = new ShiftService(shift).calculateEarnings();

      expect(earnings).toBe(75);
    });

    test("Should calculate the earnings when user pass start and end dates instead shift", () => {
      const start = now.toString();
      const end = addMinutes(now, DIFFERENCE_SHIFT).toString();
      const { hourValue } = shiftMock.shift;

      const earnings = ShiftService.calculateEarnings({
        startDate: start,
        endDate: end,
        hourValue,
        isPublicHoliday: false,
      });
      expect(earnings).toBe(50);
    });

    test("Should calculate the earnings when user pass start and end dates instead shift and is public holiday", () => {
      const start = now.toString();
      const end = addMinutes(now, DIFFERENCE_SHIFT).toString();
      const { hourValue } = shiftMock.shift;

      const earnings = ShiftService.calculateEarnings({
        startDate: start,
        endDate: end,
        hourValue,
        isPublicHoliday: true,
      });

      expect(earnings).toBe(75);
    });

    test("Should calculate the earnings of a production shift", () => {
      const mock = {
        ...shiftMock.shift,
        shiftId: 1,
        startDate: now.toString(),
        endDate: addMinutes(now, 480).toString(),
        itemValue: 10,
        itemQuantity: 10,
      };

      const shift = new ShiftService({ ...mock }).differenceInMinsBetweenStartAndEnd().build();

      const earnings = new ShiftService(shift).calculateEarnings();

      expect(earnings).toBe(100);
    });
  });
});

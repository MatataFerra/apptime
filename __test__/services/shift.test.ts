import { Shift } from "@prisma/client";
import { addDays, addMinutes } from "date-fns";
import { cloneDeep } from "lodash";
import { describe, expect, test } from "vitest";

import ShiftService from "@/services/Shift";

import { TypeShift } from "@/types";

import { now } from "@/utils/constants";

import shiftMock from "../../mocks/shift.prisma.json";

const DIFFERENCE_SHIFT = 300;

describe("ShiftService", () => {
  describe("Check if shift builds correctly", () => {
    let start = addMinutes(now, -DIFFERENCE_SHIFT).toString();

    const SHIFT_MOCK = {
      ...shiftMock.shift,
      typeShift: "TRACK" as TypeShift,
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
      const shift = new ShiftService({ ...SHIFT_MOCK, isClosed: true, typeShift: "TRACK" })
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
        holidayPayRate: 0,
        hourValue: 10,
        taxCode: 0,
        unpaidBreaks: 0,
        itemQuantity: null,
        itemValue: null,
        typeShift: "TRACK",
      });
    });

    test("should return the endDate with different value", () => {
      const shift = new ShiftService({
        ...shiftMock.shift,
        startDate: start,
        endDate: addDays(now, 1).toString(),
        typeShift: "TRACK",
      })
        .closeShift()
        .build();

      expect(shift.endDate).not.toBe(SHIFT_MOCK.endDate);
      expect(shift.endDate).toBe(addDays(now, 1).toString());
      expect(shift.endDate).not.toBe(now.toString());
      expect(SHIFT_MOCK.endDate).toBeNull();
    });

    test("should build a production shift", () => {
      const shift = new ShiftService({
        ...shiftMock.shift,
        startDate: start,
        endDate: addDays(now, 1).toString(),
        typeShift: "FAST" as TypeShift,
        itemValue: 10,
        itemQuantity: 10,
      })
        .closeShift()
        .typeShift()
        .build();

      expect(shift.itemValue).toBe(10);
      expect(shift.itemQuantity).toBe(10);
      expect(shift.typeShift).toBe("PRODUCTION");
    });
  });

  describe("Should calculate earnings", () => {
    test("Should calculate the earnings of a shift", () => {
      const mock: Shift = {
        ...shiftMock.shift,
        startDate: now.toString(),
        endDate: addMinutes(now, DIFFERENCE_SHIFT).toString(),
      };

      const shift = new ShiftService({ ...mock, typeShift: mock.typeShift as TypeShift })
        .differenceInMinsBetweenStartAndEnd()
        .build();

      const earnings = ShiftService.calculateEarnings({ shift });

      expect(earnings).toBe(50);
    });

    test("Should calculate the earnings of a shift with 2 unpaid breaks", () => {
      const mock: Shift = {
        ...shiftMock.shift,
        typeShift: "TRACK" as TypeShift,
        startDate: now.toString(),
        endDate: addMinutes(now, 480).toString(),
        unpaidBreaks: 2,
      };

      const shift = new ShiftService({ ...mock, typeShift: mock.typeShift as TypeShift })
        .differenceInMinsBetweenStartAndEnd()
        .build();

      const earnings = ShiftService.calculateEarnings({ shift });

      expect(earnings).toBe(70);
    });

    test("Should calculate the earnings of a shift when is public holiday", () => {
      const mock: Shift = {
        ...shiftMock.shift,
        startDate: now.toString(),
        endDate: addMinutes(now, DIFFERENCE_SHIFT).toString(),
        isPublicHoliday: true,
        publicHolidayWorked: true,
      };

      const shift = new ShiftService({ ...mock, typeShift: mock.typeShift as TypeShift })
        .differenceInMinsBetweenStartAndEnd()
        .build();

      const earnings = ShiftService.calculateEarnings({
        shift,
      });

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
      const mock: Shift = {
        ...shiftMock.shift,
        typeShift: "PRODUCTION" as TypeShift,
        startDate: now.toString(),
        endDate: addMinutes(now, 480).toString(),
        itemValue: 10,
        itemQuantity: 10,
      };

      const shift = new ShiftService({ ...mock, typeShift: mock.typeShift as TypeShift })
        .differenceInMinsBetweenStartAndEnd()
        .build();

      const earnings = ShiftService.calculateProductionEarnings({
        hourValue: shift.hourValue,
        itemValue: shift.itemValue,
        itemQuantity: shift.itemQuantity,
        holidayPayRate: shift.holidayPayRate,
        isPublicHoliday: shift.isPublicHoliday,
        publicHolidayWorked: shift.publicHolidayWorked,
      });

      expect(earnings).toBe(100);
    });
  });
});

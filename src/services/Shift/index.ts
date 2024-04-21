import { Shift } from "@prisma/client";
import { differenceInMinutes } from "date-fns";
import cloneDeep from "lodash/cloneDeep";

import { type ShiftCreate } from "@/types";

import prisma from "../../../prisma/client";

type ShiftConfig = {
  hourValue: ShiftCreate["hourValue"];
  holidayPay: ShiftCreate["holidayPay"];
  holidayPayRate: ShiftCreate["holidayPayRate"];
  taxCode: ShiftCreate["taxCode"];
  unpaidBreaks: ShiftCreate["unpaidBreaks"];
};

interface ShiftServiceInterface {
  shift: ShiftCreate;
  create: ({ userId }: { userId: string }) => Promise<Shift>;
  differenceInMinsBetweenStartAndEnd: () => void;
  closeShift: () => void;
  checkPublicHoliday: () => void;
  typeShift: () => void;
  build: () => ShiftCreate;
}

/**
 * @class ShiftService
 * @description This class is responsible for all the logic related to the Shift model
 * this class is based on Builder pattern
 * @method differenceInMinsBetweenStartAndEnd - Calculates the difference between the start and end of a shift
 * @method convertAmountInDecimal - Converts the amount of minutes in decimal
 * @param {ShiftWithoutId["amount"]} amount - The amount of minutes.
 * @method calculateEarnings - Calculates the earnings of a shift
 * @param {Shift} shift - The shift
 * @param {UserType["profile"]} profile - The user profile
 * @param {string} startDate - The start date of the shift
 * @param {string} endDate - The end date of the shift
 * @method shiftStatus - Checks if the shift is closed
 * @method checkPublicHoliday - Checks if the shift is a public holiday
 * @method create - Creates a new shift and executes all the methods above
 * @method build - Returns the shift
 */
class ShiftService implements ShiftServiceInterface {
  shift: ShiftCreate;
  constructor(shift: ShiftCreate) {
    this.shift = cloneDeep(shift);
  }

  async delete({ id }: { id: number }) {
    const deleteShift = await prisma.shift.delete({
      where: {
        id,
      },
    });

    return deleteShift;
  }

  async create({ userId }: { userId: string }) {
    const createShift = await prisma.shift.create({
      data: {
        User: {
          connect: {
            id: userId,
          },
        },
        startDate: this.shift.startDate,
        endDate: this.shift.endDate,
        amount: this.shift.amount,
        isClosed: this.shift.isClosed,
        isPublicHoliday: this.shift.isPublicHoliday,
        notes: this.shift.notes,
        publicHolidayWorked: this.shift.publicHolidayWorked,
        holidayPay: this.shift.holidayPay,
        hourValue: this.shift.hourValue,
        holidayPayRate: this.shift.holidayPayRate,
        taxCode: this.shift.taxCode,
        unpaidBreaks: this.shift.unpaidBreaks,
        itemQuantity: this.shift.itemQuantity,
        itemValue: this.shift.itemValue,
        typeShift: this.shift.typeShift,
      },
    });

    return createShift;
  }

  async update({ shiftId }: { shiftId: number }) {
    const updateShift = await prisma.shift.update({
      where: {
        id: shiftId,
      },
      data: {
        startDate: this.shift.startDate,
        endDate: this.shift.endDate,
        amount: this.shift.amount,
        isClosed: this.shift.isClosed,
        isPublicHoliday: this.shift.isPublicHoliday,
        notes: this.shift.notes,
        publicHolidayWorked: this.shift.publicHolidayWorked,
        holidayPay: this.shift.holidayPay,
        hourValue: this.shift.hourValue,
        holidayPayRate: this.shift.holidayPayRate,
        taxCode: this.shift.taxCode,
        unpaidBreaks: this.shift.unpaidBreaks,
        itemQuantity: this.shift.itemQuantity,
        itemValue: this.shift.itemValue,
        typeShift: this.shift.typeShift,
      },
    });

    return updateShift;
  }

  static calculateProductionEarnings({
    itemValue,
    itemQuantity,
    hourValue,
    holidayPayRate,
    publicHolidayWorked,
    isPublicHoliday,
  }: {
    itemValue: ShiftCreate["itemValue"];
    itemQuantity: ShiftCreate["itemQuantity"];
    hourValue: ShiftCreate["hourValue"];
    publicHolidayWorked: ShiftCreate["publicHolidayWorked"];
    holidayPayRate: ShiftCreate["holidayPayRate"];
    isPublicHoliday: ShiftCreate["isPublicHoliday"];
  }) {
    let publicHolidayRate = 1;
    let holidayPayRateValue = !!holidayPayRate ? holidayPayRate / 100 + 1 : 1;
    if (!itemValue || !itemQuantity || !hourValue) return 0;

    if (publicHolidayWorked) {
      publicHolidayRate = 1.5;
    }

    return itemValue * itemQuantity * publicHolidayRate * holidayPayRateValue;
  }

  static calculateEarnings({
    shift,
    startDate,
    endDate,
    isPublicHoliday,
    hourValue,
    unpaidBreaks,
    holidayPayRate,
    hoursWorked,
  }: {
    shift?: Omit<Shift, "id">;
    hourValue?: number;
    startDate?: string;
    endDate?: string;
    isPublicHoliday?: boolean;
    unpaidBreaks?: number;
    holidayPayRate?: number;
    hoursWorked?: number;
  }) {
    const MIN_MINUTES_WORKED = 8 * 60;
    let amount = 0;
    let totalTime = 0;
    let publicHolidayRate = 1;
    const holidayPayRateValue = this.getHolidayPayRateValue(
      holidayPayRate ?? 0,
      shift?.holidayPayRate
    );
    const hourJobValue = shift?.hourValue ?? hourValue;
    const unpaidBreaksValue = shift?.unpaidBreaks ?? unpaidBreaks;
    const minutesUnpaids = (unpaidBreaksValue ?? 0) * 30;

    let minuteRate = hourJobValue ? hourJobValue / 60 : 0;

    if (startDate && endDate) {
      const start = new Date(startDate ?? "");
      const end = new Date(endDate ?? "");

      amount = differenceInMinutes(end, start);
    } else if (hoursWorked) {
      amount = hoursWorked * 60;
    } else {
      const start = new Date(shift?.startDate ?? "");
      const end = new Date(shift?.endDate ?? "");
      amount = differenceInMinutes(end, start);
    }

    if (amount <= 0) amount = 0;

    if (shift?.isPublicHoliday || isPublicHoliday) {
      publicHolidayRate = 1.5;
    }

    if (amount < MIN_MINUTES_WORKED) {
      totalTime = amount;
    } else {
      totalTime = amount - minutesUnpaids;
    }

    const earnings = totalTime * minuteRate * publicHolidayRate * holidayPayRateValue;

    return Math.round(earnings * 100) / 100;
  }

  static differenceInHHmm(start: string | number | Date, end?: string | number | Date) {
    let startDate: Date;
    let endDate: Date;

    if (typeof start === "string" || typeof start === "number") {
      startDate = new Date(start);
    } else {
      startDate = start;
    }

    endDate = !!end ? new Date(end) : new Date(Date.now());

    const difference = Math.abs(differenceInMinutes(startDate, endDate));
    const getHours = difference / 60;

    return {
      text: `${Math.floor(getHours)}h ${this.decimals(getHours)}m`,
      hours: getHours,
      minutes: this.decimals(getHours),
      diff: difference,
    };
  }

  static findUnClosedShift(shifts: Shift[] | undefined) {
    if (!shifts) return null;
    return shifts.find((shift) => !shift.isClosed);
  }

  static shiftsSorted(shifts: Shift[] | undefined, { desc = true }: { desc?: boolean } = {}) {
    if (!shifts) return null;
    if (desc) {
      return shifts
        .filter((shift) => shift.isClosed)
        .toSorted((a, b) => {
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        });
    }

    return shifts.toSorted((a, b) => {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
  }

  static convertAmountInDecimal(amount: ShiftCreate["amount"]): number {
    const validAmount = amount ?? 0;
    return Math.round((validAmount / 60) * 100) / 100;
  }

  static groupShiftsByMonths(shifts: Shift[] | undefined) {
    if (!shifts) return null;
    return shifts.reduce(
      (acc, shift) => {
        const date = new Date(shift.startDate);
        const month = date.toLocaleString("en-US", { month: "short" });
        const key = `${month}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(shift);
        return acc;
      },
      {} as Record<string, Shift[]>
    );
  }

  static getLastConfigShift(shifts: Shift[] | undefined): ShiftConfig | null {
    const lastShift = shifts?.at(-1);

    if (!lastShift) return null;

    const config = {
      hourValue: lastShift?.hourValue,
      holidayPay: lastShift?.holidayPay,
      holidayPayRate: lastShift?.holidayPayRate,
      taxCode: lastShift?.taxCode,
      unpaidBreaks: lastShift?.unpaidBreaks,
    };

    return config;
  }

  static convertHourlyRateInMinuteRate(hourlyRate: ShiftCreate["hourValue"]) {
    return hourlyRate / 60;
  }

  static convertHourInFloat(hour: string) {
    const [hourPart, minutePart] = hour.split(":");
    return Number(hourPart) + Number(minutePart) / 60;
  }

  static convertFloatInHour(float: number) {
    const hour = Math.floor(float);
    const minute = Math.round((float - hour) * 60);

    return `${hour.toString().padStart(2, "0")}:${minute}`;
  }

  private static getHolidayPayRateValue(
    holidayPayRate?: number,
    shiftHolidayPay?: ShiftCreate["holidayPayRate"]
  ) {
    return !!shiftHolidayPay
      ? shiftHolidayPay / 100 + 1
      : !!holidayPayRate
        ? holidayPayRate / 100 + 1
        : 1;
  }

  closeShift() {
    this.updateEndDate().updateStatus();

    return this;
  }

  differenceInMinsBetweenStartAndEnd() {
    const start = new Date(this?.shift?.startDate ?? Date.now());

    if (!this.shift?.endDate) {
      this.shift.amount = 0;
      return this;
    }

    const end = new Date(this.shift.endDate);
    const difference = differenceInMinutes(end, start);

    this.shift.amount = difference;

    return this;
  }

  checkPublicHoliday() {
    if (this.shift.publicHolidayWorked) {
      this.shift.isPublicHoliday = true;

      return this;
    }

    return this;
  }

  typeShift() {
    if (this.shift.itemValue && this.shift.itemQuantity) {
      this.shift.typeShift = "PRODUCTION";
    }

    return this;
  }

  build() {
    return this.shift;
  }

  private updateEndDate() {
    if (this.shift.isClosed) {
      this.shift.endDate = !!this.shift.endDate
        ? this.shift.endDate
        : new Date(Date.now()).toString();
    }

    return this;
  }

  private updateStatus() {
    if (!this.shift.endDate) {
      this.shift.isClosed = false;

      return this;
    }

    this.shift.isClosed = true;

    return this;
  }

  private static decimals(hours: number) {
    const getDecimals = Math.floor(Number("0." + String(hours).split(".")[1]) * 60);

    if (isNaN(getDecimals)) return 0;

    return getDecimals;
  }
}

export default ShiftService;

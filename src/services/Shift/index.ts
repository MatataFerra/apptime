import { Shift } from "@prisma/client";
import { differenceInMinutes } from "date-fns";
import { cloneDeep } from "lodash";

import { UserType } from "@/types";

import prisma from "../../../prisma/client";

type ShiftWithoutId = Omit<Shift, "id">;

interface ShiftServiceInterface {
  shift: ShiftWithoutId;
  create: ({ userId }: { userId: string }) => Promise<Shift>;
  differenceInMinsBetweenStartAndEnd: () => void;
  closeShift: () => void;
  checkPublicHoliday: () => void;
  build: () => Omit<Shift, "id">;
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
  shift: ShiftWithoutId;
  constructor(shift: ShiftWithoutId) {
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
      },
    });

    return createShift;
  }

  static calculateEarnings({
    shift,
    profile,
    startDate,
    endDate,
    isPublicHoliday,
  }: {
    shift?: Omit<Shift, "id">;
    profile: UserType["profile"];
    startDate?: string;
    endDate?: string;
    isPublicHoliday?: boolean;
  }) {
    let amount = 0;
    let holidayRate = 1;
    let minuteRate = profile?.hourlyRate ? profile?.hourlyRate / 60 : 1;

    if (startDate && endDate) {
      const start = new Date(startDate ?? "");
      const end = new Date(endDate ?? "");

      amount = differenceInMinutes(end, start);
    } else {
      const start = new Date(shift?.startDate ?? "");
      const end = new Date(shift?.endDate ?? "");
      amount = differenceInMinutes(end, start);
    }

    if (amount <= 0) amount = 0;

    if (shift?.isPublicHoliday || isPublicHoliday) {
      holidayRate = 1.5;
    }

    const earnings = amount * minuteRate * holidayRate;

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
      return shifts.toSorted((a, b) => {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      });
    }

    return shifts.toSorted((a, b) => {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
  }

  static convertAmountInDecimal(amount: ShiftWithoutId["amount"]): number {
    const validAmount = amount ?? 0;
    return Math.round((validAmount / 60) * 100) / 100;
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

  build() {
    return this.shift;
  }

  private updateEndDate() {
    this.shift.endDate = !!this.shift.endDate
      ? this.shift.endDate
      : new Date(Date.now()).toString();

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

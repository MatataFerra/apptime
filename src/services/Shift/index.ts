import { Shift } from "@prisma/client";
import { differenceInMinutes } from "date-fns";
import _ from "lodash";

type ShiftWithoutId = Omit<Shift, "id">;

interface ShiftServiceInterface {
  shift: ShiftWithoutId;
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
 * @method shiftStatus - Checks if the shift is closed
 * @method checkPublicHoliday - Checks if the shift is a public holiday
 * @method create - Creates a new shift and executes all the methods above
 * @method build - Returns the shift
 */
class ShiftService implements ShiftServiceInterface {
  shift: ShiftWithoutId;
  constructor(shift: ShiftWithoutId) {
    this.shift = shift;
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

    function decimals(hours: number) {
      const getDecimals = Math.floor(Number("0." + String(hours).split(".")[1]) * 60);

      if (isNaN(getDecimals)) return 0;

      return getDecimals;
    }

    return {
      text: `${Math.floor(getHours)}h ${decimals(getHours)}m`,
      hours: getHours,
      minutes: decimals(getHours),
      diff: difference,
    };
  }

  static findUnClosedShift(shifts: Shift[] | undefined) {
    if (!shifts) return null;
    return shifts.find((shift) => !shift.isClosed);
  }

  static shiftsSorted(shifts: Shift[] | undefined) {
    return shifts?.toSorted((a, b) => {
      if (!a.isClosed || !b.isClosed) return 0;

      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
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

  private updateEndDate() {
    this.shift.endDate = new Date(Date.now()).toString();

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

  private updateStatus() {
    if (!this.shift.endDate) {
      this.shift.isClosed = false;

      return this;
    }

    this.shift.isClosed = true;

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
}

export default ShiftService;

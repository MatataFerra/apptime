import { Profile, Shift } from "@prisma/client";
import { differenceInMinutes } from "date-fns";
import _ from "lodash";
import ProfileService from "../Profile";

type ShiftServiceType = Omit<Shift, "id">;

interface ShiftServiceInterface {
  shift: ShiftServiceType;
  differenceInMinsBetweenStartAndEnd: () => void;
  updateStatus: () => void;
}

/**
 * @class ShiftService
 * @description This class is responsible for all the logic related to the Shift model
 * this class is based on Builder pattern
 * @method differenceInMinsBetweenStartAndEnd - Calculates the difference between the start and end of a shift
 * @method convertAmountInDecimal - Converts the amount of minutes in decimal
 * @param {ShiftServiceType["amount"]} amount - The amount of minutes.
 * @method shiftStatus - Checks if the shift is closed
 * @method checkPublicHoliday - Checks if the shift is a public holiday
 * @method create - Creates a new shift and executes all the methods above
 * @method build - Returns the shift
 */
class ShiftService implements ShiftServiceInterface {
  shift: ShiftServiceType;
  constructor(shift: ShiftServiceType) {
    this.shift = shift;
  }

  differenceInMinsBetweenStartAndEnd() {
    const start = new Date(this.shift.startDate);

    if (!this.shift?.endDate) {
      this.shift.amount = 0;
      return this;
    }

    const end = new Date(this.shift.endDate);
    const difference = differenceInMinutes(end, start);

    this.shift.amount = difference;

    return this;
  }

  static convertAmountInDecimal(amount: ShiftServiceType["amount"]): number {
    const validAmount = amount ?? 0;
    return Math.round((validAmount / 60) * 100) / 100;
  }

  updateStatus() {
    if (!this.shift.endDate) {
      this.shift.isClosed = false;

      return this;
    }

    this.shift.isClosed = true;
    return this;
  }

  checkPublicHoliday() {
    if (this.shift.holidayWorked) {
      this.shift.isHoliday = true;

      return this;
    }

    return this;
  }

  create() {
    this.differenceInMinsBetweenStartAndEnd();
    this.updateStatus();
    this.checkPublicHoliday();

    return this.shift;
  }

  build() {
    return this.shift;
  }
}

export default ShiftService;

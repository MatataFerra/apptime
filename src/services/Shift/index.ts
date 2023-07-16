import { Profile, Shift } from "@prisma/client";
import { differenceInMinutes } from "date-fns";
import _ from "lodash";
import ProfileService from "../Profile";

type ShiftServiceType = Omit<Shift, "id">;

interface ShiftServiceInterface {
  shift: ShiftServiceType;
  differenceInMinsBetweenStartAndEnd: () => void;
  updateStatus: () => void;
  publicHolidayPay: (profile: Profile) => number;
}

/**
 * @class ShiftService
 * @description This class is responsible for all the logic related to the Shift model
 * @method differenceBetweenStartAndEnd - Calculates the difference between the start and end of a shift
 * @param {ShiftServiceType} shift - The shift object.
 * @method convertAmountInDecimal - Converts the amount of minutes in decimal
 * @param {ShiftServiceType["amount"]} amount - The amount of minutes.
 * @method shiftStatus - Checks if the shift is closed
 * @param {ShiftServiceType} shift - The shift object.
 */
class ShiftService implements ShiftServiceInterface {
  shift: ShiftServiceType;
  constructor(shift: ShiftServiceType) {
    this.shift = shift;
  }

  differenceInMinsBetweenStartAndEnd() {
    const start = new Date(this.shift.startDate);
    const end = new Date(this.shift?.endDate ?? "");
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

  publicHolidayPay(profile: Profile) {
    const amount = this.shift.amount ?? 0;
    let rate: number = 1;
    const hourlyRate = ProfileService.convertHourlyRateInMinuteRate(
      profile.hourlyRate
    );

    if (this.shift.holidayWorked) rate = profile.holidayPayRate ?? 1;

    const holidayPay = amount * hourlyRate * rate;

    return holidayPay;
  }

  build() {
    return this.shift;
  }
}

export default ShiftService;

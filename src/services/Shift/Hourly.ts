import type { Contribution, Hourly, Tax } from "@prisma/client";
import { differenceInMinutes, endOfDay, isSameDay, startOfDay } from "date-fns";

import type { HourlyType, SalaryItemInput } from "@/types";

export type HourlyOptions = {
  deleteTaxes?: Tax[];
  createTaxes?: SalaryItemInput[];
  /** Owner of the shift; new taxes are created for this user. */
  userId?: string;
};

interface HourlyInterface {
  build(): Omit<Hourly, "shiftId" | "id">;
  calculateEarnings(): number;
  getConfig(): Pick<Hourly, "hourValue" | "unpaidBreaks" | "employerId" | "currency">;
}

/**
 * @class HourlyService
 * @description This class is responsible for all the logic related to the Hourly model
 * this class is based on Builder pattern
 * @param {Hourly} shift - The shift
 * @method build - Returns the shift
 * @method calculateEarnings - Calculates the earnings of a shift
 * @method getConfig - Returns the configuration of the shift
 * @method getLastConfigShift - Returns the last configuration of a shift
 * @method groupShiftsByMonths - Groups the shifts by months
 * @method convertHourlyRateInMinuteRate - Converts the hourly rate in minute rate
 * @method convertHourInFloat - Converts the hour in float
 * @method convertFloatInHour - Converts the float in hour
 */

class HourlyService implements HourlyInterface {
  // Set by the server-side subclass (services/Shift/server.ts), which saves the shift.
  protected taxes: Pick<Tax, "id">[];
  protected contributions: Pick<Contribution, "id">[];
  protected options?: HourlyOptions;
  shift: Omit<HourlyType, "shiftId" | "id">;
  constructor(shift: Omit<HourlyType, "shiftId" | "id">, options?: HourlyOptions) {
    this.shift = shift;
    this.options = options;
    this.taxes = [];
    this.contributions = [];
  }

  build() {
    return this.shift;
  }

  calculateEarnings() {
    const MIN_MINUTES_WORKED = this.shift?.unpaidBreaks ? this.shift?.unpaidBreaks : 0;
    let amount = 0;
    let amountHolidayPayable = 0;
    let totalTime = 0;

    const hourJobValue = this.shift?.hourValue || 0;
    const unpaidBreaksValue = this.shift?.unpaidBreaks || 0;
    const minuteRate = hourJobValue / 60;

    const start = this.shift?.startDate ? new Date(this.shift.startDate) : null;
    const end = this.shift?.endDate ? new Date(this.shift.endDate) : null;
    const isPublicHoliday = this.shift?.isPublicHoliday || false;

    if (start && end) {
      if (isSameDay(start, end)) {
        isPublicHoliday
          ? (amountHolidayPayable = differenceInMinutes(end, start))
          : (amount = differenceInMinutes(end, start));
      } else {
        amount = differenceInMinutes(end, startOfDay(end));
        amountHolidayPayable = differenceInMinutes(endOfDay(start), start);
      }
    }

    const totalAmount = amount + amountHolidayPayable;

    // Adjust for public holiday rate and minimum minutes worked
    const publicHolidayRate = this.shift.publicHolidayWorked ? 1.5 : 1;

    if (totalAmount < MIN_MINUTES_WORKED) {
      totalTime = amount + amountHolidayPayable * publicHolidayRate;
    } else {
      const regularAmount = amount - unpaidBreaksValue;
      totalTime = regularAmount + amountHolidayPayable * publicHolidayRate;
    }

    const earnings = totalTime * minuteRate;

    return Math.round(earnings * 100) / 100;
  }

  getConfig() {
    return {
      hourValue: this.shift.hourValue,
      unpaidBreaks: this.shift.unpaidBreaks,
      // Shifts cached before the field existed come without it.
      employerId: this.shift.employerId ?? null,
      currency: this.shift.currency ?? null,
    };
  }

  /*  
    ============================================================
    Static methods
    ============================================================
  */

  static findUnClosedShift(shifts: Hourly[] | undefined) {
    if (!shifts) return null;
    return shifts.find((shift) => !shift.isClosed);
  }

  static getLastConfigShift(shifts: Hourly[] | undefined) {
    const lastShift = shifts?.at(-1);

    if (!lastShift) return null;

    const config = {
      hourValue: lastShift?.hourValue,
      unpaidBreaks: lastShift?.unpaidBreaks,
    };

    return config;
  }

  static groupShiftsByMonths(shifts: Hourly[]) {
    return shifts.reduce(
      (acc, shift) => {
        const date = new Date(shift.startDate);
        const month = date.toLocaleString("en-US", { month: "short" });
        const key = `${month}`;

        if (!acc[key]) {
          acc[key] = [];
        }

        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(shift);
        return acc;
      },
      {} as Record<string, Hourly[]>
    );
  }

  static convertHourlyRateInMinuteRate(hourlyRate: Hourly["hourValue"]) {
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
  /*  
    ============================================================
    Private methods
    ============================================================
  */

  protected getTaxesIds(taxes: Tax[]): number[] {
    const idTaxes = taxes.reduce((acc: number[], curr) => {
      const { id } = curr;

      return [...acc, id];
    }, []);

    return idTaxes;
  }
}

export default HourlyService;

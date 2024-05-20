import { Hourly } from "@prisma/client";
import { differenceInMinutes } from "date-fns";

import prisma from "../../../prisma/client";

/**
 * @class HourlyService
 * @description This class is responsible for all the logic related to the Hourly model
 * this class is based on Builder pattern
 * @param {Hourly} shift - The shift
 * @method update - Updates a shift
 * @method create - Creates a new shift
 * @method delete - Deletes a shift
 * @method build - Returns the shift
 * @method calculateEarnings - Calculates the earnings of a shift
 * @method getConfig - Returns the configuration of the shift
 * @method getLastConfigShift - Returns the last configuration of a shift
 * @method groupShiftsByMonths - Groups the shifts by months
 * @method convertHourlyRateInMinuteRate - Converts the hourly rate in minute rate
 * @method convertHourInFloat - Converts the hour in float
 * @method convertFloatInHour - Converts the float in hour
 */

class HourlyService {
  shift: Hourly;
  constructor(shift: Hourly) {
    this.shift = shift;
  }

  async update(id: number) {
    const updateHourlyShift = await prisma.hourly.update({
      where: {
        id: id,
      },
      data: {
        ...this.shift,
      },
    });

    return updateHourlyShift;
  }

  async create() {
    const createHourlyShift = await prisma.hourly.create({
      data: {
        ...this.shift,
      },
    });

    return createHourlyShift;
  }

  async delete(id: number) {
    const deleteShift = await prisma.hourly.delete({
      where: {
        id,
      },
    });

    return deleteShift;
  }

  build() {
    return this.shift;
  }

  calculateEarnings() {
    const MIN_MINUTES_WORKED = 8 * 60;
    let amount = 0;
    let totalTime = 0;
    let publicHolidayRate = 1;
    const holidayPayRateValue = this.shift?.holidayPayRate
      ? this.shift?.holidayPayRate / 100 + 1
      : 1;
    const hourJobValue = this.shift?.hourValue;
    const unpaidBreaksValue = this.shift?.unpaidBreaks;
    const minutesUnpaids = (unpaidBreaksValue ?? 0) * 30;

    let minuteRate = hourJobValue ? hourJobValue / 60 : 0;

    if (this.shift.startDate && this.shift.endDate) {
      const start = new Date(this.shift?.startDate ?? "");
      const end = new Date(this.shift?.endDate ?? "");
      amount = differenceInMinutes(end, start);
    }

    if (amount <= 0) amount = 0;

    if (this.shift?.isPublicHoliday) {
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

  getConfig() {
    return {
      hourValue: this.shift.hourValue,
      holidayPay: this.shift.holidayPay,
      holidayPayRate: this.shift.holidayPayRate,
      taxCode: this.shift.taxCode,
      unpaidBreaks: this.shift.unpaidBreaks,
    };
  }

  static getLastConfigShift(shifts: Hourly[] | undefined) {
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
}

export default HourlyService;

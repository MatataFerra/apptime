import type { Contribution, Hourly, Tax } from "@prisma/client";
import { differenceInMinutes, endOfDay, isSameDay, startOfDay } from "date-fns";

import ContributionService from "@/services/Contribution";
import TaxService from "@/services/Tax";

import type { HourlyType } from "@/types";

import prisma from "../../../prisma/client";

type HourlyOptions = {
  deleteTaxes?: Tax[];
  createTaxes?: Omit<Tax, "id">[];
};

interface HourlyInterface {
  update(id: number): Promise<Hourly>;
  create(): Promise<Hourly>;
  delete(id: number): Promise<Hourly>;
  addtaxes(taxes: Tax[] | Omit<Tax, "id">[]): Promise<HourlyService>;
  build(): Omit<Hourly, "shiftId" | "id">;
  calculateEarnings(): number;
  getConfig(): Pick<Hourly, "hourValue" | "unpaidBreaks">;
}

/**
 * @class HourlyService
 * @description This class is responsible for all the logic related to the Hourly model
 * this class is based on Builder pattern
 * @param {Hourly} shift - The shift
 * @method update - Updates a shift with or without `taxes`
 * @method create - Creates a new shift with or without `taxes`
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

class HourlyService implements HourlyInterface {
  private taxes: Pick<Tax, "id">[];
  private contributions: Pick<Contribution, "id">[];
  private options?: HourlyOptions;
  shift: Omit<HourlyType, "shiftId" | "id">;
  constructor(shift: Omit<HourlyType, "shiftId" | "id">, options?: HourlyOptions) {
    this.shift = shift;
    this.options = options;
    this.taxes = [];
    this.contributions = [];
  }

  /*  
    ============================================================
    CRUD methods
    ============================================================
  */

  /*
    ===========================
    -----------Create----------
    ===========================
  */

  async create() {
    const createHourlyShift = await prisma.hourly.create({
      data: {
        ...this.shift,
        taxes: {
          connect: this.taxes,
        },
        contributions: {
          connect: this.contributions,
        },
      },
    });

    return createHourlyShift;
  }

  /*
    ===========================
    -----------Update----------
    ===========================
  */
  async update(id: number) {
    const { deleteTaxes, createTaxes } = this.options || {};

    // Delete case
    if (this.getTaxesIds(deleteTaxes ?? []).length > 0) {
      const updatedShiftData = await prisma.hourly.update({
        where: { id },
        data: {
          ...this.shift,
          taxes: {
            deleteMany: { id: { in: this.getTaxesIds(deleteTaxes ?? []) } },
          },
        },
      });

      return updatedShiftData;
    }

    // Create case
    if (createTaxes && createTaxes?.length > 0) {
      await this.addtaxes(createTaxes);
      const updatedShiftData = await prisma.hourly.update({
        where: { id },
        data: {
          ...this.shift,
          taxes: {
            connect: this.taxes,
          },
        },
      });

      return updatedShiftData;
    }

    // Default case
    const updatedShiftData = await prisma.hourly.update({
      where: { id },
      data: {
        ...this.shift,
        taxes: {},
      },
    });

    return updatedShiftData;
  }

  /*
    ===========================
    -----------Delete----------
    ===========================
  */

  async delete(id: number) {
    const deleteShift = await prisma.hourly.delete({
      where: {
        id,
      },
    });

    return deleteShift;
  }

  /*  
    ============================================================
    Helper methods
    ============================================================
  */

  async addContributions(contributions: Contribution[] | Omit<Contribution, "id">[]) {
    const created = await new ContributionService(contributions).create();

    this.contributions = created;

    return this;
  }

  async addtaxes(taxes: Tax[] | Omit<Tax, "id">[]) {
    const created = await new TaxService(taxes).create();

    this.taxes = created;

    return this;
  }

  build() {
    return this.shift;
  }

  calculateEarnings() {
    const MIN_MINUTES_WORKED = this.shift?.unpaidBreaks ? this.shift?.unpaidBreaks * 30 : 30;
    let amount = 0;
    let amountHolidayPayable = 0;
    let totalTime = 0;

    const hourJobValue = this.shift?.hourValue || 0;
    const unpaidBreaksValue = this.shift?.unpaidBreaks || 0;
    const minutesUnpaids = unpaidBreaksValue * 30;
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
      totalTime = amount + amountHolidayPayable * publicHolidayRate - minutesUnpaids;
    }

    const earnings = totalTime * minuteRate;

    return Math.round(earnings * 100) / 100;
  }

  getConfig() {
    return {
      hourValue: this.shift.hourValue,
      unpaidBreaks: this.shift.unpaidBreaks,
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

  private async add() {}

  private getTaxesIds(taxes: Tax[]): number[] {
    const idTaxes = taxes.reduce((acc: number[], curr) => {
      const { id } = curr;

      return [...acc, id];
    }, []);

    return idTaxes;
  }
}

export default HourlyService;

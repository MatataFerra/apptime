import type { Hourly, Production, Tax } from "@prisma/client";
import { differenceInMinutes, isAfter } from "date-fns";
import isEmpty from "lodash/isEmpty";

import { withContributions } from "@/services/Contribution/math";
import HourlyService from "@/services/Shift/Hourly";
import ProductionService from "@/services/Shift/Production";

import type { HourlyType, ProductionType, Shifts } from "@/types";

import { clonePlain } from "@/utils/helpers/clonePlain";

type ShiftHourlyOrProduction = Hourly | Production;
type ShiftWithTaxesType = HourlyType | ProductionType;

type Shift =
  | ShiftHourlyOrProduction
  | ShiftWithTaxesType
  | Partial<ShiftHourlyOrProduction>
  | Partial<ShiftWithTaxesType>;

export type UpdateOptions = {
  createTaxes?: Tax[];
  deleteTaxes?: Tax[];
};

interface ShiftServiceInterface {
  shift: Shift;
  differenceInMinsBetweenStartAndEnd: () => this;
  closeShift: () => this;
  checkPublicHoliday: () => this;
  removeTaxes: (taxes?: Tax[] | null) => this;
  build: () => void;
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
 * @method build - Returns the shift
 */
class ShiftService implements ShiftServiceInterface {
  shift: Shift;
  constructor(shift: Shift) {
    this.shift = clonePlain(shift);
  }

  /*  
    ============================================================
    Public methods
    ============================================================
  */

  /** Pay for the shift, plus its contributions (holiday pay…) when it has any. */
  calculateEarnings() {
    const base = this.isProductionShift
      ? new ProductionService(this.shift as Production).calculateEarnings()
      : new HourlyService(this.shift as Hourly).calculateEarnings();
    const contributions = (this.shift as Partial<ShiftWithTaxesType>).contributions;

    return withContributions(base, contributions);
  }

  /*  
    ============================================================
    Static methods
    ============================================================
  */

  static differenceInHHmm(start: string | number | Date, end?: string | number | Date | null) {
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

  static convertDifferenceInHHmm(difference: number | undefined) {
    if (!difference)
      return {
        text: `...`,
        hours: 0,
        minutes: 0,
        diff: difference,
      };

    const getHours = difference / 60;

    return {
      text: `${Math.floor(getHours)}h ${this.decimals(getHours)}m`,
      hours: getHours,
      minutes: this.decimals(getHours),
      diff: difference,
    };
  }

  /**
   *
   * @deprecated Use `getLatestUnclosedShift` instead if you want to get the latest unclosed shift between all
   * or `findUnClosedShift` in Hourly or Production services
   */
  static findUnClosedShift(shifts: Production[] | Hourly[] | undefined) {
    if (!shifts) return null;
    return shifts.find((shift) => !shift.isClosed);
  }

  static shiftsSorted(
    shifts: Production[] | Hourly[] | undefined,
    { desc = true }: { desc?: boolean } = {}
  ) {
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

  static sortAllShifts(
    shifts: ((Production | Hourly) & { type: "hourly" | "production" })[] | undefined,
    { desc = true }: { desc?: boolean } = {}
  ) {
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

  static convertAmountInDecimal(amount: number): number {
    const validAmount = amount ?? 0;
    return Math.round((validAmount / 60) * 100) / 100;
  }

  static isProductionShift(shift: ShiftHourlyOrProduction): shift is Production {
    return (shift as Production).itemValue !== undefined;
  }

  static groupShiftsByMonths(shifts: Production[] | Hourly[] | undefined) {
    if (!shifts) return null;

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
      {} as Record<string, ShiftHourlyOrProduction[]>
    );
  }

  static getLastConfigShift(shifts: Production[] | Hourly[] | undefined) {
    const lastShift = shifts?.at(-1);

    if (!lastShift) return null;

    if (ShiftService.isProductionShift(lastShift)) {
      return new ProductionService(lastShift).getConfig();
    }

    return new HourlyService(lastShift).getConfig();
  }

  static getLatestShift(shifts: Partial<Shifts> | undefined | null) {
    if (!shifts) return null;

    const hourly = ShiftService.shiftsSorted(shifts.hourly);
    const production = ShiftService.shiftsSorted(shifts.production);

    if (!hourly && !production) return null;

    const lastHourly = hourly?.find((shift) => shift.endDate !== null);
    const lastProduction = production?.find((shift) => shift.endDate !== null);

    if (!lastHourly && !lastProduction) return null;

    if (!lastHourly) return lastProduction;
    if (!lastProduction) return lastHourly;

    return isAfter(new Date(lastHourly.startDate), new Date(lastProduction.startDate))
      ? lastHourly
      : lastProduction;
  }

  static getLatestUnclosedShift(shifts: Partial<Shifts> | undefined) {
    if (!shifts) return null;

    const hourly = ShiftService.shiftsSorted(shifts.hourly);
    const production = ShiftService.shiftsSorted(shifts.production);

    if (!hourly && !production) return null;

    const lastHourly = hourly?.find((shift) => !shift.isClosed);
    const lastProduction = production?.find((shift) => !shift.isClosed);

    if (!lastHourly && !lastProduction) return null;

    if (!lastHourly) return lastProduction;
    if (!lastProduction) return lastHourly;

    return isAfter(new Date(lastHourly.startDate), new Date(lastProduction.startDate))
      ? lastHourly
      : lastProduction;
  }

  static calculateEarnings({
    hourValue,
    hoursWorked,
    startDate,
    endDate,
    unpaidBreaks,
    isPublicHoliday,
  }: {
    hourValue: number;
    hoursWorked?: number;
    startDate?: string;
    endDate?: string;
    unpaidBreaks?: number;
    isPublicHoliday?: boolean;
  }) {
    const MIN_MINUTES_WORKED = 60;
    let amount = 0;
    let totalTime = 0;
    let publicHolidayRate = 1;
    const hourJobValue = hourValue;
    const unpaidBreaksValue = unpaidBreaks ?? 0;

    let minuteRate = hourJobValue ? hourJobValue / 60 : 0;

    if (startDate && endDate) {
      const start = new Date(startDate ?? "");
      const end = new Date(endDate ?? "");
      amount = differenceInMinutes(end, start);
    } else if (hoursWorked) {
      amount = hoursWorked * 60;
    }

    if (amount <= 0) amount = 0;

    if (isPublicHoliday) {
      publicHolidayRate = 1.5;
    }

    if (amount < MIN_MINUTES_WORKED) {
      totalTime = amount;
    } else {
      totalTime = amount - unpaidBreaksValue;
    }

    const earnings = totalTime * minuteRate * publicHolidayRate;

    return Math.round(earnings * 100) / 100;
  }

  /*  
    ============================================================
    Build methods
    ============================================================
  */

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

  removeTaxes(taxes?: Tax[] | null) {
    if (isEmpty(taxes) || !taxes) return this;

    if (this.shiftHasTaxes()) {
      let cache = clonePlain(this.shift) as ShiftWithTaxesType;
      const taxIdsToDelete = new Set(taxes.map((t) => t.id));

      cache.taxes = cache?.taxes?.filter((t) => !taxIdsToDelete.has(t.id));

      this.shift = cache;
      return this;
    }

    return this;
  }

  checkPublicHoliday() {
    if (this.shift.publicHolidayWorked) {
      this.shift.isPublicHoliday = true;

      return this;
    }

    return this;
  }

  buildProduction() {
    return new ProductionService(this.shift as Production).build();
  }

  buildHourly() {
    return new HourlyService(this.shift as Hourly).build();
  }

  build<T extends ShiftHourlyOrProduction>(): T {
    return this.shift as T;
  }

  /*  
    ============================================================
    Private methods
    ============================================================
  */

  private updateEndDate() {
    if (this.shift.isClosed) {
      this.shift.endDate = !!this.shift.endDate
        ? this.shift.endDate
        : new Date(Date.now()).toString();
    }

    return this;
  }

  private updateStatus() {
    if (!!this.shift.endDate) {
      this.shift.isClosed = true;
      return this;
    }

    this.shift.isClosed = false;

    return this;
  }

  private static decimals(hours: number) {
    const getDecimals = Math.floor(Number("0." + String(hours).split(".")[1]) * 60);

    if (isNaN(getDecimals)) return 0;

    return getDecimals;
  }

  protected get isProductionShift(): boolean {
    const shift = this.shift as Production;

    return !!shift.itemValue;
  }

  private shiftHasTaxes(): this is ShiftWithTaxesType {
    return Object.prototype.hasOwnProperty.call(this.shift, "taxes");
  }
}

export default ShiftService;

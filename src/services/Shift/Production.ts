import type { Contribution, Production, Tax } from "@prisma/client";

import type { ProductionType, SalaryItemInput } from "@/types";

import { DEFAULT_HOLIDAY_RATE } from "@/utils/constants";

export type HourlyOptions = {
  deleteTaxes?: Tax[];
  createTaxes?: SalaryItemInput[];
  /** Owner of the shift; new taxes are created for this user. */
  userId?: string;
};

interface ProductionInterface {
  build(): Omit<Production, "shiftId" | "id">;
  calculateEarnings(): number;
  getConfig(): Pick<Production, "itemValue" | "itemQuantity">;
}

/**
 * @class ProductionService
 * @description Class to handle the production shifts
 * @param {Production} shift - The production shift
 * @method build - Returns the production shift
 * @method calculateEarnings - Calculates the earnings of a production shift
 * @method getConfig - Returns the configuration of the production shift
 * @method getLastConfigShift - Returns the last configuration of a production shift
 * @method groupShiftsByMonths - Groups the production shifts by months
 *
 */

class ProductionService implements ProductionInterface {
  // Set by the server-side subclass (services/Shift/server.ts), which saves the shift.
  protected taxes: Pick<Tax, "id">[];
  protected contributions: Pick<Contribution, "id">[];
  protected options?: HourlyOptions;
  shift: Omit<ProductionType, "shiftId" | "id">;
  constructor(shift: Omit<ProductionType, "shiftId" | "id">, options?: HourlyOptions) {
    this.shift = shift;
    this.options = options;
    this.taxes = [];
    this.contributions = [];
  }

  build() {
    return this.shift;
  }

  calculateEarnings() {
    let publicHolidayRate = 1;

    if (!this.shift.itemValue || !this.shift.itemQuantity) return 0;

    if (this.shift.publicHolidayWorked) {
      // The rate the shift was saved with; older shifts were always 1.5.
      publicHolidayRate = this.shift.holidayRate ?? DEFAULT_HOLIDAY_RATE;
    }

    return this.shift.itemValue * this.shift.itemQuantity * publicHolidayRate;
  }

  getConfig() {
    return {
      itemValue: this.shift.itemValue,
      itemQuantity: this.shift.itemQuantity,
    };
  }

  /*  
    ============================================================
    Static methods
    ============================================================
  */

  static findUnClosedShift(shifts: Production[] | undefined) {
    if (!shifts) return null;
    return shifts.find((shift) => !shift.isClosed);
  }

  static getLastConfigShift(shifts: Production[] | undefined) {
    const lastShift = shifts?.at(-1);

    if (!lastShift) return null;

    const config = {
      itemValue: lastShift?.itemValue,
      itemQuantity: lastShift?.itemQuantity,
    };

    return config;
  }

  static groupShiftsByMonths(shifts: Production[]) {
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
      {} as Record<string, Production[]>
    );
  }

  static earnings({
    itemValue,
    itemQuantity,
    publicHolidayWorked,
  }: {
    itemValue: number | null;
    itemQuantity: number | null;
    publicHolidayWorked: boolean | null;
  }) {
    let publicHolidayRate = 1;
    if (!itemValue || !itemQuantity) return 0;

    if (publicHolidayWorked) {
      publicHolidayRate = 1.5;
    }

    return itemValue * itemQuantity * publicHolidayRate;
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

export default ProductionService;

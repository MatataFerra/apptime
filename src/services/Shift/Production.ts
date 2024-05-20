import { Production } from "@prisma/client";

import prisma from "../../../prisma/client";

/**
 * @class ProductionService
 * @description Class to handle the production shifts
 * @param {Production} shift - The production shift
 * @method update - Updates a production shift
 * @method create - Creates a new production shift
 * @method delete - Deletes a production shift
 * @method build - Returns the production shift
 * @method calculateEarnings - Calculates the earnings of a production shift
 * @method getConfig - Returns the configuration of the production shift
 * @method getLastConfigShift - Returns the last configuration of a production shift
 * @method groupShiftsByMonths - Groups the production shifts by months
 *
 */

class ProductionService {
  shift: Production;
  constructor(shift: Production) {
    this.shift = shift;
  }

  async update(id: number) {
    const updateProductionShift = await prisma.production.update({
      where: {
        id: id,
      },
      data: {
        ...this.shift,
      },
    });

    return updateProductionShift;
  }

  async create() {
    const createProductionShift = await prisma.production.create({
      data: {
        ...this.shift,
      },
    });

    return createProductionShift;
  }

  async delete(id: number) {
    const deleteShift = await prisma.production.delete({
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
    let publicHolidayRate = 1;
    let holidayPayRateValue = !!this.shift.holidayPayRate ? this.shift.holidayPayRate / 100 + 1 : 1;
    if (!this.shift.itemValue || !this.shift.itemQuantity) return 0;

    if (this.shift.publicHolidayWorked) {
      publicHolidayRate = 1.5;
    }

    return this.shift.itemValue * this.shift.itemQuantity * publicHolidayRate * holidayPayRateValue;
  }

  getConfig() {
    return {
      itemValue: this.shift.itemValue,
      itemQuantity: this.shift.itemQuantity,
      holidayPay: this.shift.holidayPay,
      holidayPayRate: this.shift.holidayPayRate,
      taxCode: this.shift.taxCode,
    };
  }

  static getLastConfigShift(shifts: Production[] | undefined) {
    const lastShift = shifts?.at(-1);

    if (!lastShift) return null;

    const config = {
      itemValue: lastShift?.itemValue,
      itemQuantity: lastShift?.itemQuantity,
      holidayPay: lastShift?.holidayPay,
      holidayPayRate: lastShift?.holidayPayRate,
      taxCode: lastShift?.taxCode,
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
}

export default ProductionService;

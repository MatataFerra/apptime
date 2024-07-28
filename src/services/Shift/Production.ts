import type { Production, Tax } from "@prisma/client";
import isEmpty from "lodash/isEmpty";

import TaxService from "@/services/Tax";

import type { ProductionType } from "@/types";

import prisma from "../../../prisma/client";

type HourlyOptions = {
  deleteTaxes?: Tax[];
  createTaxes?: Tax[];
};

interface ProductionInterface {
  update(id: number): Promise<Production>;
  create(): Promise<Production>;
  delete(id: number): Promise<Production>;
  addtaxes(taxes: Tax[] | Omit<Tax, "id">[]): Promise<ProductionService>;
  build(): Omit<Production, "shiftId" | "id">;
  calculateEarnings(): number;
  getConfig(): Pick<Production, "itemValue" | "itemQuantity" | "holidayPay" | "holidayPayRate">;
}

/**
 * @class ProductionService
 * @description Class to handle the production shifts
 * @param {Production} shift - The production shift
 * @method update - Updates a production shift
 * @method create - Creates a new production shift with or without `taxes`
 * @method delete - Deletes a production shift
 * @method build - Returns the production shift
 * @method calculateEarnings - Calculates the earnings of a production shift
 * @method getConfig - Returns the configuration of the production shift
 * @method getLastConfigShift - Returns the last configuration of a production shift
 * @method groupShiftsByMonths - Groups the production shifts by months
 *
 */

class ProductionService implements ProductionInterface {
  private taxes: Pick<Tax, "id">[];
  private options?: HourlyOptions;
  shift: Omit<ProductionType, "shiftId" | "id">;
  constructor(shift: Omit<ProductionType, "shiftId" | "id">, options?: HourlyOptions) {
    this.shift = shift;
    this.taxes = [];
    this.options = options;
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
    if (isEmpty(this.taxes)) {
      const productionShiftWithoutTax = await prisma.production.create({
        data: {
          ...(this.shift as Production),
        },
      });

      return productionShiftWithoutTax;
    }

    const createProductionShift = await prisma.production.create({
      data: {
        ...this.shift,
        taxes: {
          connect: this.taxes,
        },
      },
    });

    return createProductionShift;
  }

  /*
    ===========================
    -----------Update----------
    ===========================
  */

  async update(id: number) {
    const { deleteTaxes, createTaxes } = this.options || {};

    const updateData: any = { ...this.shift };

    if (this.getTaxesIds(deleteTaxes ?? []).length > 0) {
      updateData.taxes = {
        deleteMany: { id: { in: this.getTaxesIds(deleteTaxes ?? []) } },
      };
    }

    if (createTaxes && createTaxes?.length > 0) {
      await this.addtaxes(createTaxes);
      updateData.taxes = {
        ...updateData.taxes,
        connect: this.taxes,
      };
    }

    const updatedShiftData = await prisma.production.update({
      where: { id },
      data: updateData,
      include: { taxes: true },
    });

    return updatedShiftData;
  }

  /*
    ===========================
    -----------Delete----------
    ===========================
  */

  async delete(id: number) {
    const deleteShift = await prisma.production.delete({
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

  async addtaxes(taxes: Tax[] | Omit<Tax, "id">[]) {
    const createTaxes = await new TaxService(taxes).create();
    this.taxes = createTaxes;
    return this;
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
      holidayPay: lastShift?.holidayPay,
      holidayPayRate: lastShift?.holidayPayRate,
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
    holidayPayRate,
    publicHolidayWorked,
  }: {
    itemValue: number | null;
    itemQuantity: number | null;
    holidayPayRate: number | null;
    publicHolidayWorked: boolean | null;
  }) {
    let publicHolidayRate = 1;
    let holidayPayRateValue = !!holidayPayRate ? holidayPayRate / 100 + 1 : 1;
    if (!itemValue || !itemQuantity) return 0;

    if (publicHolidayWorked) {
      publicHolidayRate = 1.5;
    }

    return itemValue * itemQuantity * publicHolidayRate * holidayPayRateValue;
  }

  /*  
    ============================================================
    Private methods
    ============================================================
  */

  private getTaxesIds(taxes: Tax[]): number[] {
    const idTaxes = taxes.reduce((acc: number[], curr) => {
      const { id } = curr;

      return [...acc, id];
    }, []);

    return idTaxes;
  }
}

export default ProductionService;

import type { Hourly, Production } from "@prisma/client";

import ContributionService from "@/services/Contribution";
import ShiftService, { type UpdateOptions } from "@/services/Shift";
import HourlyService from "@/services/Shift/Hourly";
import ProductionService from "@/services/Shift/Production";
import TaxService from "@/services/Tax";

import type { HourlyType, ProductionType, SalaryItemInput } from "@/types";

import "server-only";

import prisma from "#/prisma/client";

/*
 * The services that write shifts. They extend the pure ones in this folder
 * (earnings, dates, builders), which client components import too: keeping
 * the database here keeps Prisma and the libSQL driver out of the browser.
 */

/**
 * The holiday multiplier a new shift is saved with: the one it brings, else
 * the owner's Settings. Stored on the shift so a later change in Settings
 * doesn't rewrite what past shifts earned.
 */
async function holidayRateFor(shift: { holidayRate?: number | null; shiftId?: number | null }) {
  if (shift.holidayRate != null) return shift.holidayRate;
  if (shift.shiftId == null) return null;
  const owner = await prisma.shift.findUnique({
    where: { id: shift.shiftId },
    select: { user: { select: { config: { select: { holidayRate: true } } } } },
  });
  return owner?.user?.config?.holidayRate ?? null;
}

/** HourlyService that can save the shift and create its taxes and contributions. */
export class HourlyRecord extends HourlyService {
  async create() {
    return prisma.hourly.create({
      data: {
        ...this.shift,
        holidayRate: await holidayRateFor(this.shift),
        taxes: { connect: this.taxes },
        contributions: { connect: this.contributions },
      },
    });
  }

  async update(id: number) {
    const { deleteTaxes, createTaxes, userId } = this.options || {};

    // Delete case
    if (this.getTaxesIds(deleteTaxes ?? []).length > 0) {
      return prisma.hourly.update({
        where: { id },
        data: {
          ...this.shift,
          taxes: { disconnect: deleteTaxes?.map((tax) => ({ id: tax.id })) },
          contributions: {},
        },
      });
    }

    // Create case
    if (userId && createTaxes && createTaxes.length > 0) {
      await this.addtaxes(createTaxes, userId);
    }

    return prisma.hourly.update({
      where: { id },
      data: {
        ...this.shift,
        taxes: { connect: this.taxes },
        contributions: { connect: this.contributions },
      },
    });
  }

  async delete(id: number) {
    return prisma.hourly.delete({ where: { id } });
  }

  async addContributions(contributions: SalaryItemInput[], userId: string) {
    this.contributions = await new ContributionService(contributions, userId).create();
    return this;
  }

  async addtaxes(taxes: SalaryItemInput[], userId: string) {
    this.taxes = await new TaxService(taxes, userId).create();
    return this;
  }
}

/** ProductionService that can save the shift and create its taxes and contributions. */
export class ProductionRecord extends ProductionService {
  async create() {
    return prisma.production.create({
      data: {
        ...this.shift,
        holidayRate: await holidayRateFor(this.shift),
        taxes: { connect: this.taxes },
        contributions: { connect: this.contributions },
      },
    });
  }

  async update(id: number) {
    const { deleteTaxes, createTaxes, userId } = this.options || {};

    // Delete case
    if (this.getTaxesIds(deleteTaxes ?? []).length > 0) {
      return prisma.production.update({
        where: { id },
        data: {
          ...this.shift,
          taxes: { disconnect: deleteTaxes?.map((tax) => ({ id: tax.id })) },
          contributions: {},
        },
      });
    }

    // Create case
    if (userId && createTaxes && createTaxes.length > 0) {
      await this.addtaxes(createTaxes, userId);
    }

    return prisma.production.update({
      where: { id },
      data: {
        ...this.shift,
        taxes: { connect: this.taxes },
        contributions: { connect: this.contributions },
      },
    });
  }

  async delete(id: number) {
    return prisma.production.delete({ where: { id } });
  }

  async addContributions(contributions: SalaryItemInput[], userId: string) {
    this.contributions = await new ContributionService(contributions, userId).create();
    return this;
  }

  async addtaxes(taxes: SalaryItemInput[], userId: string) {
    this.taxes = await new TaxService(taxes, userId).create();
    return this;
  }
}

/** ShiftService that saves the shift as hourly or production, whichever it is. */
export class ShiftRecord extends ShiftService {
  async create<T extends Hourly | Production>(): Promise<T | undefined> {
    if (this.isProductionShift) {
      return (await new ProductionRecord(this.shift as Production).create()) as T;
    }
    return (await new HourlyRecord(this.shift as Hourly).create()) as T;
  }

  async update<T extends HourlyType | ProductionType>(
    id?: number,
    options?: UpdateOptions
  ): Promise<T | null> {
    if (!id) return null;
    if (this.isProductionShift) {
      return (await new ProductionRecord(this.shift as ProductionType, options).update(id)) as T;
    }
    return (await new HourlyRecord(this.shift as HourlyType, options).update(id)) as T;
  }

  async delete(id: number): Promise<Hourly | Production | undefined> {
    if (this.isProductionShift) {
      return new ProductionRecord(this.shift as Production).delete(id);
    }
    return new HourlyRecord(this.shift as Hourly).delete(id);
  }
}

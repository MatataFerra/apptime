import type { Tax } from "@prisma/client";

import type { SalaryItemInput } from "@/types";

import "server-only";

import prisma from "#/prisma/client";

/**
 * Each user owns their rows, and a row is only reused when the name *and*
 * rate match, so a shift never ends up with a different percentage.
 */
function sameItem(a: { name: string; value: number }, b: { name: string; value: number }) {
  return a.name === b.name && Number(a.value) === Number(b.value);
}

class TaxService {
  taxes: SalaryItemInput[];
  userId: string;
  constructor(taxes: SalaryItemInput[], userId: string) {
    this.taxes = taxes;
    this.userId = userId;
  }

  async create() {
    const taxesFromDB = await TaxService.getAll(this.userId);
    const filteredTaxes = this.prepareTaxesToCreate(taxesFromDB);
    const taxesToCreate = filteredTaxes.filter((tax) => !tax.exists).map((tax) => tax.tax);
    let existingTaxes: Tax[] = [];

    const newTaxes = await this.createNewTaxes(taxesToCreate);

    for (const tax of this.taxes) {
      const findTax = taxesFromDB.find((userTax) => sameItem(userTax, tax));
      if (findTax) existingTaxes.push(findTax);
    }

    await this.unarchive(existingTaxes);
    return newTaxes.concat(existingTaxes.map((tax) => ({ id: tax.id })));
  }

  /** The user's own rows, archived ones included (they can be reused). */
  static async getAll(userId: string) {
    return prisma.tax.findMany({ where: { userId }, orderBy: { archived: "asc" } });
  }

  /** A removed item that gets typed in again shows up in the picker again. */
  private async unarchive(items: { id: number; archived: boolean }[]) {
    const ids = items.filter((item) => item.archived).map((item) => item.id);
    if (ids.length === 0) return;
    await prisma.tax.updateMany({
      where: { id: { in: ids }, userId: this.userId },
      data: { archived: false },
    });
  }

  private async createNewTaxes(taxesToCreate: SalaryItemInput[]) {
    const createdTaxes = taxesToCreate.map(async (tax) => {
      const newTax = await prisma.tax.create({
        data: {
          name: tax.name,
          value: tax.value,
          userId: this.userId,
          description: tax.description,
        },
      });
      return { id: newTax.id };
    });

    return Promise.all(createdTaxes);
  }

  prepareTaxesToCreate(dbTaxes: Tax[]) {
    return this.taxes.map((taxLocal) => {
      const existingTax = dbTaxes.find((taxDB) => sameItem(taxDB, taxLocal)) as Tax;
      if (existingTax) {
        return { id: existingTax.id, exists: true, tax: taxLocal };
      } else {
        return { exists: false, tax: taxLocal };
      }
    });
  }

  static calcularTasaImpuestoEfectiva(ingresoAnual: number): number {
    const tramos = [
      [14000, 0.105],
      [48000, 0.175],
      [70000, 0.3],
      [116640, 0.33],
      [Infinity, 0.39],
    ];

    let ingresoReduce = ingresoAnual;
    const acc = 0.015 * ingresoAnual;

    const indice = tramos.reduce((accumulator, current, index, array) => {
      const [tope, tasa] = current;
      if (ingresoReduce <= 0) return accumulator;
      const [previous] = array[index - 1] ?? [0];
      const base = Math.min(ingresoReduce, tope - previous);

      accumulator += base * tasa;
      ingresoReduce -= base;

      return accumulator;
    }, 0);

    const nuevoImpuesto = indice + acc;
    const tasaImpuestoEfectiva = nuevoImpuesto / ingresoAnual;

    return tasaImpuestoEfectiva;
  }
}

export default TaxService;

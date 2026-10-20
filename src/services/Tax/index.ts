import type { Tax } from "@prisma/client";

import prisma from "#/prisma/client";

/**
 * Rows are shared, so only reuse one with the same name *and* rate.
 * Matching by name alone linked a shift to someone else's "Income tax"
 * with a different percentage.
 */
function sameItem(a: { name: string; value: number }, b: { name: string; value: number }) {
  return a.name === b.name && Number(a.value) === Number(b.value);
}

class TaxService {
  taxes: Omit<Tax, "id">[];
  constructor(taxes: Omit<Tax, "id">[]) {
    this.taxes = taxes;
  }

  async create() {
    const taxesFromDB = await TaxService.getAll();
    const filteredTaxes = this.prepareTaxesToCreate(taxesFromDB);
    const taxesToCreate = filteredTaxes.filter((tax) => !tax.exists).map((tax) => tax.tax);
    let existingTaxes: Tax[] = [];

    const newTaxes = await this.createNewTaxes(taxesToCreate);

    for (const tax of this.taxes) {
      const findTax = taxesFromDB.find((userTax) => sameItem(userTax, tax));
      if (findTax) existingTaxes.push(findTax);
    }

    return newTaxes.concat(existingTaxes.map((tax) => ({ id: tax.id })));
  }

  static async getAll() {
    return prisma.tax.findMany();
  }

  private async createNewTaxes(taxesToCreate: Omit<Tax, "id">[]) {
    const createdTaxes = taxesToCreate.map(async (tax) => {
      const newTax = await prisma.tax.create({
        data: {
          name: tax.name,
          value: tax.value,
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

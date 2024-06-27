import type { Tax } from "@prisma/client";

import prisma from "#/prisma/client";

class TaxService {
  taxes: Omit<Tax, "id">[];
  constructor(taxes: Omit<Tax, "id">[]) {
    this.taxes = taxes;
  }

  async create() {
    const taxesFromDB = await prisma.tax.findMany();
    const filteredTaxes = this.prepareTaxesToCreate(taxesFromDB);
    const taxesToCreate = filteredTaxes.filter((tax) => !tax.exists).map((tax) => tax.tax);

    const newTaxes = await this.createNewTaxes(taxesToCreate);

    return newTaxes;
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
      const existingTax = dbTaxes.find((taxDB) => taxDB.name === taxLocal.name) as Tax;
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

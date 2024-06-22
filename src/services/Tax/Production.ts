import type { Tax, TaxProductionSaved } from "@prisma/client";

import prisma from "#/prisma/client";

class TaxProductionService {
  taxes: Omit<Tax, "id">[];
  constructor(taxes: Omit<Tax, "id">[]) {
    this.taxes = taxes;
  }

  async save(configId: number): Promise<TaxProductionSaved[]> {
    const savedTaxesConfig = await prisma.taxSaved.findFirst({
      where: {
        configId,
      },
    });

    if (!savedTaxesConfig) {
      const saveTax = await prisma.taxSaved.create({
        data: {
          config: {
            connect: {
              id: configId,
            },
          },
          productionTaxes: {},
          hourlyTaxes: {},
        },
      });
      const create = await prisma.taxProductionSaved.createManyAndReturn({
        data: this.prepareTaxProductionSaved(saveTax.id),
      });
      return create;
    }

    const transaction = await prisma.taxProductionSaved.createManyAndReturn({
      data: this.prepareTaxProductionSaved(savedTaxesConfig.id),
    });

    return transaction;
  }

  async create() {
    // retrieve all taxes from the database
    const taxesFromDB = await prisma.tax.findMany();

    // map through the taxes and check if they exist in the database
    const taxConnectOrCreate = this.taxes.map(async (taxLocal) => {
      const existingTax = taxesFromDB.find((taxDB) => {
        return taxDB.name === taxLocal.name;
      });

      if (existingTax) {
        return { id: existingTax.id };
      } else {
        const newTax = await prisma.tax.create({
          data: {
            name: taxLocal.name,
            value: taxLocal.value,
            description: taxLocal.description,
          },
        });
        return { id: newTax.id };
      }
    });

    // wait for all the taxes to be created or connected
    const taxes = await Promise.all(taxConnectOrCreate);

    return taxes;
  }

  prepareTaxProductionSaved(taxsaveID: number): Omit<TaxProductionSaved, "id">[] {
    return this.taxes.map((tax) => {
      return {
        name: tax.name,
        value: tax.value,
        description: tax.description,
        taxSavedId: taxsaveID,
      };
    });
  }
}

export default TaxProductionService;

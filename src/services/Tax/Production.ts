import type { Tax, TaxProductionSaved } from "@prisma/client";

import prisma from "#/prisma/client";

class TaxProductionService {
  taxes: Omit<Tax, "id">[];
  constructor(taxes: Omit<Tax, "id">[]) {
    this.taxes = taxes;
  }

  async save(configId: number) {
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
        data: this.parseTax(saveTax.id),
      });
      return create;
    }

    const transaction = await prisma.$transaction([
      prisma.taxProductionSaved.deleteMany(),
      prisma.taxProductionSaved.createManyAndReturn({
        data: this.parseTax(savedTaxesConfig.id),
      }),
    ]);

    return transaction;
  }

  parseTax(taxsaveID: number): Omit<TaxProductionSaved, "id">[] {
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

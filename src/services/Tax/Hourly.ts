import type { Tax, TaxHourlySaved } from "@prisma/client";

import prisma from "#/prisma/client";

class TaxHourlyService {
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
      const create = await prisma.taxHourlySaved.createManyAndReturn({
        data: this.parseTax(saveTax.id),
      });
      return create;
    }

    const transaction = await prisma.$transaction([
      prisma.taxHourlySaved.deleteMany(),
      prisma.taxHourlySaved.createManyAndReturn({
        data: this.parseTax(savedTaxesConfig.id),
      }),
    ]);

    return transaction;
  }

  parseTax(taxsaveID: number): Omit<TaxHourlySaved, "id">[] {
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

export default TaxHourlyService;

"use server";

import type { TaxHourlySaved, TaxProductionSaved } from "@prisma/client";

import prisma from "#/prisma/client";

async function remove(type: "production" | "hourly", tax: TaxProductionSaved | TaxHourlySaved) {
  if (type === "hourly") {
    const deletedTax = await prisma.taxHourlySaved.delete({
      where: {
        id: tax.id,
      },
    });

    return deletedTax;
  }

  if (type === "production") {
    const deletedTax = await prisma.taxProductionSaved.delete({
      where: {
        id: tax.id,
      },
    });

    return deletedTax;
  }

  return null;
}

export default remove;

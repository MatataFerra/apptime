"use server";

import type { Production, TaxProductionSaved } from "@prisma/client";
import { revalidatePath } from "next/cache";

import ShiftService from "@/services/Shift";
import ProductionService from "@/services/Shift/Production";
import TaxProductionService from "@/services/Tax/Production";
import UserService from "@/services/User";

import { ProductionInputsParsed } from "@/types/forms";

export default async function onSubmitFastCharge(data: ProductionInputsParsed) {
  const currentUser = await UserService.getSessionUser();

  if (!currentUser) {
    return null;
  }

  if (currentUser.shifts?.id === null) {
    return null;
  }

  const shift = new ShiftService({
    startDate: data.startDate,
    endDate: data.endDate,
    holidayPayRate: data.holidayPayRate,
    itemValue: data.itemValue,
    itemQuantity: data.itemQuantity,
    isPublicHoliday: data.isPublicHoliday,
    publicHolidayWorked: data.publicHolidayWorked,
    holidayPay: data.holidayPayRate > 0,
    amount: 0,
    isClosed: true,
    notes: "",
    shiftId: currentUser.shifts?.id,
  })
    .closeShift()
    .checkPublicHoliday()
    .differenceInMinsBetweenStartAndEnd()
    .build<Production>();

  try {
    let taxesCreated: TaxProductionSaved[] = [];
    let createShift: Production | null = null;

    const taxesFromLocal = data.taxes
      .filter((tax) => tax.name && tax.value)
      .map((tax) => ({
        ...tax,
      }));

    new ProductionService(shift)
      .addtaxes(taxesFromLocal)
      .then((service) => {
        return service.create();
      })
      .then((createdProduction) => {
        createShift = createdProduction;
      })
      .catch((error) => {
        return {
          response: false,
          message: error.message,
        };
      });
    if (data.saveTaxes) {
      taxesCreated = await new TaxProductionService(taxesFromLocal).save(currentUser.config!.id);
    }

    revalidatePath("/dashboard", "page");

    return { createShift, taxesCreated };
  } catch (error) {
    return null;
  }
}

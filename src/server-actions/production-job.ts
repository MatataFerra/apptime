"use server";

import type { Production } from "@prisma/client";
import isEmpty from "lodash/isEmpty";
import { revalidatePath } from "next/cache";

import ShiftService from "@/services/Shift";
import TaxService from "@/services/Tax";
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
    .build();

  try {
    const createShift = await new ShiftService(shift).create<Production>();

    if (!isEmpty(data.taxes) && createShift) {
      const taxesWithId = data.taxes
        .filter((tax) => tax.name && tax.value)
        .map((tax) => ({
          ...tax,
          productionId: createShift.id,
        }));
      await new TaxService(taxesWithId).create();

      if (data.saveTaxes) {
        await new TaxProductionService(taxesWithId).save(currentUser.config!.id);
      }
    }

    revalidatePath("/dashboard", "page");

    return createShift;
  } catch (error) {
    return null;
  }
}

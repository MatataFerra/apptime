"use server";

import type { Production } from "@prisma/client";

import { ownEmployerId } from "@/services/Employer/owned";
import ShiftService from "@/services/Shift";
import ProductionService from "@/services/Shift/Production";
import UserService from "@/services/User";

import type { ProductionInputsParsed } from "@/types/forms";

import { revalidateShiftPages } from "@/utils/helpers/revalidateShiftPages";

export default async function onCreateProductionShift(data: ProductionInputsParsed) {
  const currentUser = await UserService.getSessionUser();

  if (!currentUser) {
    return null;
  }

  if (currentUser.shifts?.id === null) {
    return null;
  }

  // Someone else's employer is refused, not silently dropped.
  const employerId = await ownEmployerId(currentUser.id, data.employerId ?? null);
  if (employerId === false) return null;

  const shift = new ShiftService({
    startDate: data.startDate,
    endDate: data.endDate,
    name: data.name?.trim(),
    itemValue: data.itemValue,
    itemQuantity: data.itemQuantity,
    isPublicHoliday: data.isPublicHoliday,
    publicHolidayWorked: data.publicHolidayWorked,
    currency: data.currency ?? null,
    employerId: employerId ?? null,
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
    const taxesFromLocal = data.taxes
      .filter((tax) => tax.name && tax.value)
      .map((tax) => {
        return {
          name: tax.name,
          value: tax.value,
          description: tax.description,
        };
      });

    const contributionsFromLocal = data.contributions
      .filter((contrib) => contrib.name && contrib.value)
      .map((contrib) => {
        return {
          name: contrib.name,
          value: contrib.value,
          description: contrib.description,
        };
      });

    const productionService = new ProductionService(shift);

    await productionService.addContributions(contributionsFromLocal, currentUser.id);
    await productionService.addtaxes(taxesFromLocal, currentUser.id);

    const response = await productionService.create();

    revalidateShiftPages();

    return {
      response: typeof response !== "string",
      createShift: response,
    };
  } catch (error) {
    // eslint-disable-next-line no-console -- server log for failed saves
    console.error("[production-job]", error);
    return null;
  }
}

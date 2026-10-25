"use server";

import type { Production } from "@prisma/client";

import { ownEmployerId } from "@/services/Employer/owned";
import ShiftService from "@/services/Shift";
import { clashesWithSaved } from "@/services/Shift/clash";
import { ProductionRecord } from "@/services/Shift/server";
import UserService from "@/services/User";

import type { ProductionInputsParsed } from "@/types/forms";

export default async function onCreateProductionShift(data: ProductionInputsParsed) {
  const currentUser = await UserService.getSessionOwner();

  if (!currentUser) {
    return null;
  }

  if (currentUser.shifts?.id === null) {
    return null;
  }

  // Another job the same day is fine; the same hours twice are not.
  if (
    currentUser.shifts?.id &&
    (await clashesWithSaved(currentUser.shifts.id, {
      startDate: data.startDate,
      endDate: data.endDate,
    }))
  ) {
    return { response: false, overlap: true } as const;
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

    const productionService = new ProductionRecord(shift);

    await productionService.addContributions(contributionsFromLocal, currentUser.id);
    await productionService.addtaxes(taxesFromLocal, currentUser.id);

    const response = await productionService.create();

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

"use server";

import type { Tax } from "@prisma/client";

import ShiftService from "@/services/Shift";
import UserService from "@/services/User";

import type { HourlyType, ProductionType } from "@/types";

import { revalidateShiftPages } from "@/utils/helpers/revalidateShiftPages";

export default async function onEditShift(data: ProductionType | HourlyType, taxes?: Tax[] | null) {
  const currentUser = await UserService.getSessionUser();

  if (!currentUser) {
    return null;
  }

  try {
    const buildShift = new ShiftService(data)
      .checkPublicHoliday()
      .differenceInMinsBetweenStartAndEnd()
      .closeShift()
      .build();

    const updateShift = await new ShiftService(buildShift).update(data.id, {
      deleteTaxes: taxes ?? [],
    });

    revalidateShiftPages();

    return updateShift;
  } catch (error) {
    return null;
  }
}

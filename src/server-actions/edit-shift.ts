"use server";

import { Shift } from "@prisma/client";
import { revalidatePath } from "next/cache";

import ShiftService from "@/services/Shift";
import UserService from "@/services/User";

export default async function onEditShift(data: Shift) {
  const currentUser = await UserService.getSessionUser();

  if (!currentUser) {
    return null;
  }

  const shift = {
    ...data,
    typeShift: data.typeShift as "TRACK" | "FAST" | "PRODUCTION",
  };

  try {
    const buildShift = new ShiftService(shift)
      .checkPublicHoliday()
      .differenceInMinsBetweenStartAndEnd()
      .closeShift()
      .build();

    const updateShift = await new ShiftService(buildShift).update({ shiftId: data.id });
    revalidatePath("/[locale]/(home)/history-shifts", "page");

    return updateShift;
  } catch (error) {
    return null;
  }
}

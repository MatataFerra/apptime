"use server";

import { Hourly, Production } from "@prisma/client";
import { revalidatePath } from "next/cache";

import ShiftService from "@/services/Shift";
import UserService from "@/services/User";

export default async function onEditShift(data: Production | Hourly) {
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

    const updateShift = await new ShiftService(buildShift).update(data.id);
    revalidatePath("/[locale]/(home)/history-shifts", "page");

    return updateShift;
  } catch (error) {
    return null;
  }
}

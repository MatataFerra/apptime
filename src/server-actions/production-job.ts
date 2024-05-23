"use server";

import { Production } from "@prisma/client";
import { revalidatePath } from "next/cache";

import ShiftService from "@/services/Shift";
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
    ...data,
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
    const createShift = await new ShiftService(shift).create();

    revalidatePath("/[locale]/(home)/history-shifts", "page");

    return createShift;
  } catch (error) {
    return null;
  }
}

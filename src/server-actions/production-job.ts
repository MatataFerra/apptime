"use server";

import { revalidatePath } from "next/cache";

import ShiftService from "@/services/Shift";
import UserService from "@/services/User";

import { ProductionInputsParsed } from "@/types/forms";

export default async function onSubmitFastCharge(data: ProductionInputsParsed) {
  const currentUser = await UserService.getSessionUser();

  if (!currentUser) {
    return null;
  }

  const shift = new ShiftService({
    ...data,
    holidayPay: data.holidayPayRate > 0,
    amount: 0,
    isClosed: true,
    notes: "",
    taxCode: 0,
    unpaidBreaks: 0,
    userId: currentUser.id,
    typeShift: "PRODUCTION",
  })
    .closeShift()
    .typeShift()
    .checkPublicHoliday()
    .differenceInMinsBetweenStartAndEnd()
    .build();

  try {
    const createShift = await new ShiftService(shift).create({ userId: currentUser.id });

    revalidatePath("/[locale]/(home)/history-shifts", "page");

    return createShift;
  } catch (error) {
    return null;
  }
}

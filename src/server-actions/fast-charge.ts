"use server";

import { revalidatePath } from "next/cache";

import ShiftService from "@/services/Shift";
import UserService from "@/services/User";

import { type FastChargeInputsParsed } from "@/types/forms";

export default async function onSubmitFastCharge(data: FastChargeInputsParsed) {
  const currentUser = await UserService.getSessionUser();

  if (!currentUser) {
    return null;
  }

  const shift = new ShiftService({
    startDate: data.startDate,
    endDate: data.endDate,
    isPublicHoliday: data.isPublicHoliday,
    publicHolidayWorked: data.isWorked,
    hourValue: data.hourValue,
    holidayPay: data.holidayPay,
    amount: 0,
    isClosed: true,
    notes: "",
    taxCode: 0,
    holidayPayRate: data.holidayPayRate,
    unpaidBreaks: data.unpaidBreaks,
    userId: currentUser.id,
    itemQuantity: null,
    itemValue: null,
    typeShift: "FAST",
  })
    .closeShift()
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

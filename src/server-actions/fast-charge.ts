"use server";

import { Hourly } from "@prisma/client";
import { revalidatePath } from "next/cache";

import ShiftService from "@/services/Shift";
import UserService from "@/services/User";

import { type FastChargeInputsParsed } from "@/types/forms";

export default async function onSubmitFastCharge(data: FastChargeInputsParsed) {
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
    isPublicHoliday: data.isPublicHoliday,
    publicHolidayWorked: data.isWorked,
    hourValue: data.hourValue,
    holidayPay: data.holidayPay,
    amount: 0,
    isClosed: true,
    notes: "",
    holidayPayRate: data.holidayPayRate,
    unpaidBreaks: data.unpaidBreaks,
    shiftId: currentUser.shifts?.id,
  })
    .closeShift()
    .checkPublicHoliday()
    .differenceInMinsBetweenStartAndEnd()
    .build<Hourly>();

  try {
    const createShift = await new ShiftService(shift).create();

    revalidatePath("/[locale]/(home)/history-shifts", "page");

    return createShift;
  } catch (error) {
    return null;
  }
}

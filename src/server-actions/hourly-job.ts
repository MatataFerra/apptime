"use server";

import type { Hourly } from "@prisma/client";
import { revalidatePath } from "next/cache";

import ShiftService from "@/services/Shift";
import HourlyService from "@/services/Shift/Hourly";
import UserService from "@/services/User";

import type { FastChargeInputsParsed } from "@/types/forms";

export default async function onCreateHourlyShift(data: FastChargeInputsParsed) {
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
    const taxesFromLocal = data.taxes
      .filter((tax) => tax.name && tax.value)
      .map((tax) => ({
        ...tax,
      }));

    const response = await new HourlyService(shift)
      .addtaxes(taxesFromLocal)
      .then((service) => {
        return service.create();
      })
      .then((createdHourly) => {
        return createdHourly;
      })
      .catch((error) => JSON.stringify(error.message));

    revalidatePath("/dashboard", "page");

    return {
      response: typeof response !== "string",
      createShift: response,
    };
  } catch (error) {
    return null;
  }
}

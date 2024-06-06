"use server";

import type { Hourly } from "@prisma/client";
import isEmpty from "lodash/isEmpty";
import { revalidatePath } from "next/cache";

import ShiftService from "@/services/Shift";
import TaxService from "@/services/Tax";
import TaxHourlyService from "@/services/Tax/Hourly";
import UserService from "@/services/User";

import type { FastChargeInputsParsed } from "@/types/forms";

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
    const createShift = await new ShiftService(shift).create<Hourly>();

    if (!isEmpty(data.taxes) && createShift) {
      const taxesWithId = data.taxes
        .filter((tax) => tax.name && tax.value)
        .map((tax) => ({
          ...tax,
          productionId: createShift.id,
        }));
      await new TaxService(taxesWithId).create();

      if (data.saveTaxes) {
        await new TaxHourlyService(taxesWithId).save(currentUser.config!.id);
      }
    }

    revalidatePath("/dashboard", "page");

    return createShift;
  } catch (error) {
    return null;
  }
}

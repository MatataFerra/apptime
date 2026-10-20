"use server";

import type { Hourly } from "@prisma/client";

import ShiftService from "@/services/Shift";
import HourlyService from "@/services/Shift/Hourly";
import UserService from "@/services/User";

import type { FastChargeInputsParsed } from "@/types/forms";

import { revalidateShiftPages } from "@/utils/helpers/revalidateShiftPages";

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
    name: data.name?.trim(),
    isPublicHoliday: data.isPublicHoliday,
    publicHolidayWorked: data.isWorked,
    hourValue: data.hourValue,
    amount: 0,
    isClosed: true,
    notes: "",
    unpaidBreaks: data.unpaidBreaks,
    shiftId: currentUser.shifts?.id,
    currency: data.currency ?? null,
    source: "fast",
  })
    .closeShift()
    .checkPublicHoliday()
    .differenceInMinsBetweenStartAndEnd()
    .build<Hourly>();

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

    const hourlyService = new HourlyService(shift);

    await hourlyService.addContributions(contributionsFromLocal);
    await hourlyService.addtaxes(taxesFromLocal);

    const response = await hourlyService.create();

    revalidateShiftPages();

    return {
      response: typeof response !== "string",
      createShift: response,
    };
  } catch (error) {
    return null;
  }
}

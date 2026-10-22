"use server";

import type { Hourly } from "@prisma/client";

import { ownEmployerId } from "@/services/Employer/owned";
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

  // Someone else's employer is refused, not silently dropped.
  const employerId = await ownEmployerId(currentUser.id, data.employerId ?? null);
  if (employerId === false) return null;

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
    employerId: employerId ?? null,
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

    await hourlyService.addContributions(contributionsFromLocal, currentUser.id);
    await hourlyService.addtaxes(taxesFromLocal, currentUser.id);

    const response = await hourlyService.create();

    revalidateShiftPages();

    return {
      response: typeof response !== "string",
      createShift: response,
    };
  } catch (error) {
    // eslint-disable-next-line no-console -- server log for failed saves
    console.error("[hourly-job]", error);
    return null;
  }
}

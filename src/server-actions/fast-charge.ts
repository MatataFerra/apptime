"use server";

import type { Hourly, TaxHourlySaved } from "@prisma/client";
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

    if (!createShift) return null;

    let taxesCreated: TaxHourlySaved[] = [];
    const hourlyTaxes = await prisma?.taxHourlySaved.findMany();
    const taxesFromDB = hourlyTaxes?.map((tax) => ({
      name: tax.name,
      value: tax.value,
      description: tax.description,
      hourlyId: createShift.id,
      productionId: null,
    }));
    const taxesFromLocal = data.taxes
      .filter((tax) => tax.name && tax.value)
      .map((tax) => ({
        ...tax,
        hourlyId: createShift.id,
      }));

    if (isEmpty(taxesFromLocal) && !isEmpty(taxesFromDB)) {
      await new TaxService(taxesFromDB!).create();
    }

    if (!isEmpty(taxesFromLocal) && isEmpty(taxesFromDB)) {
      await new TaxService(taxesFromLocal).create();
      if (data.saveTaxes) {
        taxesCreated = await new TaxHourlyService(taxesFromLocal).save(currentUser.config!.id);
      }
    }

    if (!isEmpty(taxesFromLocal) && !isEmpty(taxesFromDB)) {
      const allTaxes = [...taxesFromDB!, ...taxesFromLocal];
      await new TaxService(allTaxes).create();
      if (data.saveTaxes) {
        taxesCreated = await new TaxHourlyService(taxesFromLocal).save(currentUser.config!.id);
      }
    }

    revalidatePath("/dashboard", "page");
    revalidatePath("/fast-charge", "page");

    return { createShift, taxesCreated };
  } catch (error) {
    return null;
  }
}

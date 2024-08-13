"use server";

import type { Hourly } from "@prisma/client";
import { revalidatePath } from "next/cache";

import ShiftService from "@/services/Shift";
import HourlyService from "@/services/Shift/Hourly";
import UserService from "@/services/User";

import type { TrackInputs } from "@/types/forms";

import type { TaxElement } from "@/store/useTaxOrContributionStore";

export default async function onUpdateTrackJob(
  data: Partial<TrackInputs> | null,
  taxes: TaxElement[],
  shiftId: number | undefined
) {
  const currentUser = await UserService.getSessionUser();

  if (!currentUser) {
    return null;
  }

  if (currentUser.shifts?.id === null) {
    return null;
  }

  if (!shiftId) return null;

  const prepareShift = {
    ...data,
    id: data?.id,
    isClosed: true,
  };
  const shift = new ShiftService(prepareShift)
    .closeShift()
    .differenceInMinsBetweenStartAndEnd()
    .checkPublicHoliday()
    .build<Hourly>();

  const taxesFromLocal = taxes
    .filter((tax) => tax.name && tax.value)
    .map((tax) => {
      return {
        name: tax.name,
        value: tax.value,
        description: tax.description,
      };
    });

  try {
    const response = await new HourlyService(shift, {
      createTaxes: taxesFromLocal,
    })
      .update(shiftId)
      .catch((error) => JSON.stringify(error.message));

    revalidatePath("/dashboard", "page");
    revalidatePath("/[locale]/(home)/dashboard/@table/@history/page", "page");

    return {
      response: typeof response !== "string",
      createShift: response,
    };
  } catch (error) {
    return null;
  }
}

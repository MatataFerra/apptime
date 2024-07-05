"use server";

import type { Hourly, Tax } from "@prisma/client";
import { revalidatePath } from "next/cache";

import ShiftService from "@/services/Shift";
import HourlyService from "@/services/Shift/Hourly";
import UserService from "@/services/User";

import type { TrackInputs } from "@/types/forms";

export default async function onUpdateTrackJob(
  data: Partial<TrackInputs> | null,
  taxes: Omit<Tax, "id">[],
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
    .map((tax) => ({
      ...tax,
    }));

  try {
    const response = await new HourlyService(shift)
      .addtaxes(taxesFromLocal)
      .then((service) => {
        return service.update(shiftId);
      })
      .then((updatedtrack) => {
        return updatedtrack;
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

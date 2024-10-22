"use server";

import type { Hourly } from "@prisma/client";
import isEmpty from "lodash/isEmpty";
import { revalidatePath } from "next/cache";

import ShiftService from "@/services/Shift";
import HourlyService from "@/services/Shift/Hourly";
import UserService from "@/services/User";

import type { TrackInputs } from "@/types/forms";

import type { ContributionElement, TaxElement } from "@/store/useTaxOrContributionStore";

type UpdateTrackData = Partial<TrackInputs> & {
  taxes: TaxElement[];
  contributions?: ContributionElement[];
};

export default async function onUpdateTrackJob(data: UpdateTrackData, shiftId: number | undefined) {
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
    ? data?.contributions
        .filter((contrib) => contrib.name && contrib.value)
        .map((contrib) => {
          return {
            name: contrib.name,
            value: contrib.value,
            description: contrib.description,
          };
        })
    : [];

  try {
    if (isEmpty(data)) return null;
    if (!data.id) return null;

    const hourlyService = new HourlyService(shift);

    await hourlyService.addContributions(contributionsFromLocal);
    await hourlyService.addtaxes(taxesFromLocal);

    const response = await hourlyService.update(data.id);

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

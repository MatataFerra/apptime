"use server";

import type { Hourly } from "@prisma/client";
import isEmpty from "lodash/isEmpty";

import ShiftService from "@/services/Shift";
import HourlyService from "@/services/Shift/Hourly";
import UserService from "@/services/User";

import type { TrackInputs } from "@/types/forms";

import { revalidateShiftPages } from "@/utils/helpers/revalidateShiftPages";

import type { ContributionElement, TaxElement } from "@/store/useTaxOrContributionStore";

type UpdateTrackData = Partial<TrackInputs> & {
  taxes: TaxElement[];
  contributions: ContributionElement[];
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
    .filter((contrib) => contrib.name && contrib.value)
    .map((contrib) => {
      return {
        name: contrib.name,
        value: contrib.value,
        description: contrib.description,
      };
    });

  try {
    if (isEmpty(data)) return null;

    const hourlyService = new HourlyService(shift);

    await hourlyService.addContributions(contributionsFromLocal, currentUser.id);
    await hourlyService.addtaxes(taxesFromLocal, currentUser.id);

    const response = await hourlyService.update(data.id!);

    revalidateShiftPages();

    return {
      response: typeof response !== "string",
      createShift: response,
    };
  } catch (error) {
    return null;
  }
}

"use server";

import type { Hourly } from "@prisma/client";
import isEmpty from "lodash/isEmpty";
import omit from "lodash/omit";

import { ownEmployerId } from "@/services/Employer/owned";
import ShiftService from "@/services/Shift";
import HourlyService from "@/services/Shift/Hourly";
import UserService from "@/services/User";

import type { TrackInputs } from "@/types/forms";

import { revalidateShiftPages } from "@/utils/helpers/revalidateShiftPages";

import type { ContributionElement, TaxElement } from "@/store/useTaxOrContributionStore";
import prisma from "#/prisma/client";

type UpdateTrackData = Partial<TrackInputs> & {
  taxes: TaxElement[];
  contributions: ContributionElement[];
};

export default async function onUpdateTrackJob(data: UpdateTrackData, shiftId: number | undefined) {
  const currentUser = await UserService.getSessionUser();

  if (!currentUser) {
    return null;
  }

  const ownShiftId = currentUser.shifts?.id;
  if (!ownShiftId || !shiftId || isEmpty(data)) return null;

  // Only the user's own shift can be closed; someone else's id is "not found".
  const owned = await prisma.hourly
    .findFirst({ where: { id: shiftId, shift: { userId: currentUser.id } }, select: { id: true } })
    .catch(() => null);
  if (!owned) return null;

  // Sent back with the shift: still has to be one of the user's employers.
  const employerId = await ownEmployerId(currentUser.id, data.employerId);
  if (employerId === false) return null;

  // Which row it is and whose container it's in come from the server, not the client.
  const prepareShift = {
    ...omit(data, ["id", "shiftId", "shift", "employer", "employerId"]),
    ...(employerId !== undefined && { employerId }),
    id: owned.id,
    shiftId: ownShiftId,
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
    const hourlyService = new HourlyService(shift);

    await hourlyService.addContributions(contributionsFromLocal, currentUser.id);
    await hourlyService.addtaxes(taxesFromLocal, currentUser.id);

    const response = await hourlyService.update(owned.id);

    revalidateShiftPages();

    return {
      response: typeof response !== "string",
      createShift: response,
    };
  } catch (error) {
    // eslint-disable-next-line no-console -- server log for failed saves
    console.error("[update-track]", error);
    return null;
  }
}

"use server";

import type { Hourly } from "@prisma/client";

import { ownEmployerId } from "@/services/Employer/owned";
import ShiftService from "@/services/Shift";
import UserService from "@/services/User";

import { HourlyCreateSchema } from "@/types";

import { revalidateShiftPages } from "@/utils/helpers/revalidateShiftPages";

export default async function onCreateTrackJob(data: Omit<Hourly, "id">) {
  const currentUser = await UserService.getSessionUser();

  if (!currentUser) {
    return null;
  }

  // The shift goes into the signed-in user's container, whatever the client sent.
  const ownShiftId = currentUser.shifts?.id;
  if (!ownShiftId) return null;

  const parsedBody = HourlyCreateSchema.safeParse(data);

  if (!parsedBody.success) return null;

  const employerId = await ownEmployerId(currentUser.id, parsedBody.data.employerId ?? null);
  if (employerId === false) return null;

  const shiftTransform = new ShiftService({
    ...parsedBody.data,
    employerId: employerId ?? null,
    shiftId: ownShiftId,
  })
    .checkPublicHoliday()
    .build<Hourly>();

  try {
    const shift = await new ShiftService(shiftTransform).create<Hourly>();

    revalidateShiftPages();

    return {
      response: true,
      shift,
    };
  } catch (error) {
    return null;
  }
}

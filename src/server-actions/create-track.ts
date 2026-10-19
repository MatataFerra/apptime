"use server";

import type { Hourly } from "@prisma/client";

import ShiftService from "@/services/Shift";
import UserService from "@/services/User";

import { HourlyCreateSchema } from "@/types";

import { revalidateShiftPages } from "@/utils/helpers/revalidateShiftPages";

export default async function onCreateTrackJob(data: Omit<Hourly, "id">) {
  const currentUser = await UserService.getSessionUser();

  if (!currentUser) {
    return null;
  }

  if (currentUser.shifts?.id === null) {
    return null;
  }

  const parsedBody = HourlyCreateSchema.safeParse(data);

  if (!parsedBody.success) return null;
  if (!parsedBody?.data?.shiftId) return null;

  const shiftTransform = new ShiftService(parsedBody.data).checkPublicHoliday().build<Hourly>();

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

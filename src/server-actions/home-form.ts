"use server";

import { Profile } from "@prisma/client";

import ProfileService from "@/services/Profile";
import UserService from "@/services/User";

import { FormStoreData } from "@/types/store";

export default async function onSubmitServerAction(data: FormStoreData): Promise<Profile | null> {
  const { user: userData, profile } = data;
  const fullname = `${userData.name} ${userData.surname}`;
  const currentUser = await UserService.getSessionUser();

  if (!currentUser) {
    return null;
  }

  if (currentUser.profile) {
    return null;
  }

  await UserService.updateUser({
    id: currentUser.id,
    user: {
      name: fullname,
      formCompleted: true,
    },
  });

  const response = await ProfileService.createProfile({
    userId: currentUser.id,
    profile: {
      endHour: profile.endHour,
      hourlyRate: profile.hourlyRate,
      startHour: profile.startHour,
      holidayPay: profile.holidayPay,
      nightShift: profile.nightShift,
      extraNightShiftPay: profile.extraNightShiftPay,
      holidayPayRate: profile.holidayPayRate,
      unpaidBreaks: profile.unpaidBreaks,
    },
  });

  if (!response) {
    return null;
  }

  return response;
}

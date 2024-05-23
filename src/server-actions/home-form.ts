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
      address: profile.address,
      city: profile.city,
      country: profile.country,
      firstName: userData.name,
      lastName: userData.surname,
    },
  });

  if (!response) {
    return null;
  }

  return response;
}

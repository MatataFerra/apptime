"use server";

import { getServerSession } from "next-auth";

import ApiService from "@/services/Api";

import { FormStoreData } from "@/types/store";

export default async function onSubmitServerAction({ user, profile }: FormStoreData) {
  // holiday pay en profile por default es 8
  const session = await getServerSession();
  const fullname = `${user.name} ${user.surname}`;

  const userByEmail = await ApiService.getUserByEmail({
    email: session?.user?.email,
    filters: "id",
  });

  const userUpdated = await ApiService.updateUser({
    user: {
      id: userByEmail.user.id,
      name: fullname,
    },
  });

  if (!userUpdated.response) {
    throw userUpdated;
  }

  const response = await ApiService.createProfile({
    profile: {
      userId: userByEmail.user.id,
      ...profile,
    },
  });

  return response;
}

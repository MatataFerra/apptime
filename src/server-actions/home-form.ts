"use server";

import { getServerSession } from "next-auth";

import api from "@/services/Api";

import { FormStoreData } from "@/types/store";

export default async function onSubmitServerAction(data: FormStoreData) {
  const { user, profile } = data;
  // holiday pay en profile por default es 8
  const session = await getServerSession();
  const fullname = `${user.name} ${user.surname}`;

  const userByEmail = await api.getUserByEmail({
    email: session?.user?.email,
    filters: "id",
  });

  if (!userByEmail.response) {
    return userByEmail;
  }

  const userUpdated = await api.updateUser({
    user: {
      id: userByEmail.user.id,
      name: fullname,
      formCompleted: true,
    },
  });

  if (!userUpdated.response) {
    return userUpdated;
  }

  const response = await api.createProfile({
    profile: {
      userId: userByEmail.user.id,
      ...profile,
    },
  });

  return response;
}

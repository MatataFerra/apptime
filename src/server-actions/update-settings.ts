"use server";

import { z } from "zod";

import ErrorFactory from "@/services/Error/factory";
import UserService from "@/services/User";

import { SETTINGS_FIELDS } from "@/utils/constants/settings";

import prisma from "#/prisma/client";

// No email here: it changes only through better-auth's changeEmail
// (Settings > Security), which confirms the new address from its inbox and
// notifies the old one. Writing it directly let anyone claim an address they
// don't own.
const SettingsSchema = z.object({
  name: z.string(),
  country: z.string(),
  city: z.string(),
});

export default async function onUpdateSettings(values: typeof SETTINGS_FIELDS) {
  const user = await UserService.getSessionOwner();

  if (!user) {
    return null;
  }

  const data = {
    name: values.account.name,
    country: values.personal.country,
    city: values.personal.city,
  };

  const checkData = SettingsSchema.safeParse(data);

  if (!checkData.success) {
    return ErrorFactory.createError("DataProvidedIsNotValid", {
      error: checkData.error,
      message: "Data provided is not valid",
    });
  }

  const updateSettings = await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { name: checkData.data.name },
    }),
    prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        country: checkData.data.country,
        city: checkData.data.city,
        firstName: "",
      },
      update: {
        country: checkData.data.country,
        city: checkData.data.city,
      },
    }),
  ]);

  if (!updateSettings) {
    return ErrorFactory.createError("SettingsNotUpdated");
  }

  return updateSettings;
}

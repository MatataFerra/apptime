"use server";

import { z } from "zod";

import ErrorFactory from "@/services/Error/factory";
import UserService from "@/services/User";

import { WEEK_DAYS } from "@/utils/constants";
import { SETTINGS_FIELDS } from "@/utils/constants/settings";

import { revalidateSettingsPage } from "@/utils/helpers/revalidateShiftPages";

const SettingsSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  country: z.string(),
  city: z.string(),
  weekStartsOn: z.enum(WEEK_DAYS).default("monday"),
});

export default async function onUpdateSettings(values: typeof SETTINGS_FIELDS) {
  const user = await UserService.getSessionUser();

  if (!user) {
    return null;
  }

  const data = {
    name: values.account.name,
    email: values.account.email,
    weekStartsOn: values.configs.weekStartsOn,
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

  const updateSettings = await prisma?.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        email: checkData.data.email,
        name: checkData.data.name,
      },
    }),
    prisma.config.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        weekStartsOn: checkData.data.weekStartsOn,
      },
      update: {
        weekStartsOn: checkData.data.weekStartsOn,
      },
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

  revalidateSettingsPage();

  return updateSettings;
}

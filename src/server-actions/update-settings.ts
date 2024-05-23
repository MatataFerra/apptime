"use server";

import { z } from "zod";

import ErrorFactory from "@/services/Error/factory";
import UserService from "@/services/User";

import { WEEK_DAYS } from "@/utils/constants";
import { SETTINGS_FIELDS } from "@/utils/constants/settings";

const SettingsSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  weekStartsOn: z.enum(WEEK_DAYS),
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
  };

  const checkData = SettingsSchema.safeParse(data);

  if (!checkData.success) {
    return ErrorFactory.createError("DataProvidedIsNotValid", {
      error: checkData.error,
      message: "Data provided is not valid",
    });
  }

  // const updateSettings = await prisma?.$transaction([
  //   prisma.user.update({
  //     where: { id: user.id },
  //     data: {
  //       email: checkData.data.email,
  //       name: checkData.data.name,
  //     },
  //   }),
  //   prisma.config.update({
  //     where: { userId: user.id },
  //     data: {
  //       weekStartsOn: checkData.data.weekStartsOn,
  //     },
  //   }),
  // ]);

  // if (!updateSettings) {
  //   return ErrorFactory.createError("SettingsNotUpdated");
  // }
}

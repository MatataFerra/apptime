"use server";

import { headers } from "next/headers";
import { z } from "zod";

import ErrorFactory from "@/services/Error/factory";
import UserService from "@/services/User";

import { auth } from "@/utils/auth";
import { SETTINGS_FIELDS } from "@/utils/constants/settings";

import prisma from "#/prisma/client";

const SettingsSchema = z.object({
  name: z.string(),
  email: z.string().email(),
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
    email: values.account.email,
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

  const email = checkData.data.email.trim().toLowerCase();
  const emailChanged = email !== user.email.toLowerCase();

  if (emailChanged) {
    const taken = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (taken) {
      return ErrorFactory.createError("DataProvidedIsNotValid", {
        message: "That email is already in use",
      });
    }
  }

  const updateSettings = await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        email,
        name: checkData.data.name,
        // A new address hasn't been verified by anyone. Keeping the flag would
        // let a Google sign-in with that address link into this account.
        ...(emailChanged ? { emailVerified: false } : {}),
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

  if (emailChanged) {
    // Rewrite the session cookie cache, or the old email lingers in it for
    // up to 5 minutes and lookups by email find no one.
    await auth.api
      .getSession({ headers: await headers(), query: { disableCookieCache: true } })
      .catch(() => null);
  }

  return updateSettings;
}

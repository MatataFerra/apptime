"use server";

import type { ErrorKey } from "@/types/i18n";

import { getSessionUserId } from "@/utils/auth/session";
import { SUPPORTED_LOCALES } from "@/utils/constants";

import { translatorFor } from "@/i18n/translator";
import prisma from "#/prisma/client";

/**
 * Deletes the signed-in user and everything that belongs to them.
 * The caller must have typed the confirmation word; checked again here.
 */
export default async function onDeleteAccount(
  confirmation: string
): Promise<{ ok: true } | { ok: false; error: ErrorKey }> {
  // The word asked for depends on the language ("delete", "borrar").
  const word = confirmation.trim().toLowerCase();
  const words = SUPPORTED_LOCALES.map((locale) =>
    translatorFor(locale)("settings.data.confirm_word")
  );
  if (!words.includes(word)) {
    return { ok: false, error: "delete_confirmation" };
  }

  const userId = await getSessionUserId();
  const user = userId
    ? await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
    : null;
  if (!user) return { ok: false, error: "not_signed_in" };

  const shift = await prisma.shift.findUnique({ where: { userId: user.id } });

  await prisma.$transaction([
    // Shift rows first; their links to taxes go with them.
    ...(shift
      ? [
          prisma.hourly.deleteMany({ where: { shiftId: shift.id } }),
          prisma.production.deleteMany({ where: { shiftId: shift.id } }),
          prisma.shift.delete({ where: { id: shift.id } }),
        ]
      : []),
    prisma.profile.deleteMany({ where: { userId: user.id } }),
    prisma.config.deleteMany({ where: { userId: user.id } }),
    // Sessions, accounts (password, Google) and taxes cascade with the user.
    prisma.user.delete({ where: { id: user.id } }),
  ]);

  return { ok: true };
}

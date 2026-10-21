"use server";

import { getSessionEmail } from "@/utils/auth/session";

import prisma from "#/prisma/client";

/**
 * Deletes the signed-in user and everything that belongs to them.
 * The caller must have typed the confirmation word; checked again here.
 */
export default async function onDeleteAccount(confirmation: string) {
  if (confirmation.trim().toLowerCase() !== "delete") {
    return { ok: false as const, error: "Type delete to confirm" };
  }

  const email = await getSessionEmail();
  const user = email
    ? await prisma.user.findUnique({ where: { email }, select: { id: true } })
    : null;
  if (!user) return { ok: false as const, error: "Not signed in" };

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

  return { ok: true as const };
}

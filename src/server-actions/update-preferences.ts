"use server";

import { z } from "zod";

import { getSessionUserId } from "@/utils/auth/session";
import { WEEK_DAYS } from "@/utils/constants";
import { CURRENCIES } from "@/utils/constants/currencies";
import { revalidateSettingsPage, revalidateShiftPages } from "@/utils/helpers/revalidateShiftPages";
import { THEMES } from "@/utils/theme";

import prisma from "#/prisma/client";

const CODES = CURRENCIES.map((c) => c.code) as [string, ...string[]];
const optionalAmount = z.number().min(0).max(100000).nullable().optional();

/** Every field optional: each control in Settings saves only what it changed. */
const PreferencesSchema = z
  .object({
    theme: z.enum(THEMES).optional(),
    currency: z.enum(CODES).optional(),
    weekStartsOn: z.enum(WEEK_DAYS).optional(),
    hourValue: optionalAmount,
    unpaidBreaks: z.number().min(0).max(600).nullable().optional(),
  })
  .strict();

export type PreferencesPatch = z.infer<typeof PreferencesSchema>;

export default async function onUpdatePreferences(patch: PreferencesPatch) {
  const userId = await getSessionUserId();
  const user = userId
    ? await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
    : null;
  if (!user) return { ok: false as const, error: "not_signed_in" };

  const parsed = PreferencesSchema.safeParse(patch);
  if (!parsed.success) return { ok: false as const, error: "invalid_value" };

  const config = await prisma.config.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...parsed.data },
    update: parsed.data,
  });

  revalidateSettingsPage();
  revalidateShiftPages();

  return { ok: true as const, config };
}

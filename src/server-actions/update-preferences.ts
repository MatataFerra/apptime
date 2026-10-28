"use server";

import { z } from "zod";

import { ownEmployerId } from "@/services/Employer/owned";

import { getSessionUserId } from "@/utils/auth/session";
import { WEEK_DAYS } from "@/utils/constants";
import { CURRENCIES } from "@/utils/constants/currencies";
import { DATE_ORDERS, TIME_FORMATS } from "@/utils/helpers/dateFormats";
import { ROUND_STEPS } from "@/utils/helpers/roundShift";
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
    itemValue: optionalAmount,
    /** 1 = no extra, 1.5 = time and a half, 2 = double time… */
    holidayRate: z.number().min(1).max(5).optional(),
    roundMinutes: z
      .number()
      .int()
      .refine((value) => (ROUND_STEPS as readonly number[]).includes(value))
      .optional(),
    defaultEmployerId: z.number().int().positive().nullable().optional(),
    earningsGoal: z.number().min(0).max(10_000_000).nullable().optional(),
    goalPeriod: z.enum(["week", "month"]).optional(),
    timeFormat: z.enum(TIME_FORMATS).optional(),
    dateFormat: z.enum(DATE_ORDERS).optional(),
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

  // Only one of the user's own employers can be the default.
  if (parsed.data.defaultEmployerId != null) {
    const owned = await ownEmployerId(user.id, parsed.data.defaultEmployerId);
    if (!owned) return { ok: false as const, error: "invalid_value" };
  }

  const config = await prisma.config.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...parsed.data },
    update: parsed.data,
  });

  return { ok: true as const, config };
}

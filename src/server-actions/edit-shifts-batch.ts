"use server";

import { z } from "zod";

import { ownEmployerId } from "@/services/Employer/owned";
import { BatchShiftIds } from "@/services/Shift/selection";
import UserService from "@/services/User";

import { CURRENCIES } from "@/utils/constants/currencies";
import { revalidateShiftPages } from "@/utils/helpers/revalidateShiftPages";

import prisma from "#/prisma/client";

const CURRENCY_CODES = CURRENCIES.map((c) => c.code) as [string, ...string[]];

/**
 * What to change on every selected shift. A field that's left out stays as
 * it is on each shift; `null` clears it (no employer, no job name, the
 * default currency).
 */
const BatchChanges = z
  .object({
    employerId: z.number().int().positive().nullable(),
    name: z.string().trim().max(100).nullable(),
    /** Hourly shifts only. */
    hourValue: z.number().finite().min(0).max(100_000),
    /** Per piece shifts only. */
    itemValue: z.number().finite().min(0).max(100_000),
    currency: z.enum(CURRENCY_CODES).nullable(),
    holiday: z.enum(["none", "worked", "off"]),
  })
  .partial()
  .strict()
  .refine((changes) => Object.keys(changes).length > 0);

const BatchEditInput = z.object({ ids: BatchShiftIds, changes: BatchChanges }).strict();

export type BatchEditInput = z.input<typeof BatchEditInput>;
export type BatchEditResult = { hourly: number; production: number };

/**
 * Applies the same changes to several of the user's shifts at once.
 * Ids that aren't theirs are skipped: every update is scoped to their
 * own shifts. Returns how many of each kind changed, or null when the
 * input or the employer isn't valid.
 */
export default async function onEditShiftsBatch(
  input: BatchEditInput
): Promise<BatchEditResult | null> {
  const user = await UserService.getSessionUser();
  if (!user?.id) return null;

  const parsed = BatchEditInput.safeParse(input);
  if (!parsed.success) return null;

  const { ids, changes } = parsed.data;
  const userId = user.id;

  const employerId = await ownEmployerId(userId, changes.employerId);
  if (employerId === false) return null;

  const common = {
    ...(employerId !== undefined && { employerId }),
    ...(changes.name !== undefined && { name: changes.name || null }),
    ...(changes.currency !== undefined && { currency: changes.currency }),
    ...(changes.holiday !== undefined && {
      isPublicHoliday: changes.holiday !== "none",
      publicHolidayWorked: changes.holiday === "worked",
    }),
  };
  const hourlyData = {
    ...common,
    ...(changes.hourValue !== undefined && { hourValue: changes.hourValue }),
  };
  const productionData = {
    ...common,
    ...(changes.itemValue !== undefined && { itemValue: changes.itemValue }),
  };

  try {
    const [hourly, production] = await prisma.$transaction([
      prisma.hourly.updateMany({
        where: { id: { in: Object.keys(hourlyData).length ? ids.hourly : [] }, shift: { userId } },
        data: hourlyData,
      }),
      prisma.production.updateMany({
        where: {
          id: { in: Object.keys(productionData).length ? ids.production : [] },
          shift: { userId },
        },
        data: productionData,
      }),
    ]);

    revalidateShiftPages();

    return { hourly: hourly.count, production: production.count };
  } catch (error) {
    // eslint-disable-next-line no-console -- server log for failed saves
    console.error("[edit-shifts-batch]", error);
    return null;
  }
}

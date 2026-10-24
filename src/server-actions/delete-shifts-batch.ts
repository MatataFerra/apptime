"use server";

import { z } from "zod";

import { BatchShiftIds } from "@/services/Shift/selection";
import UserService from "@/services/User";

import { revalidateShiftPages } from "@/utils/helpers/revalidateShiftPages";

import prisma from "#/prisma/client";

const BatchDeleteInput = z.object({ ids: BatchShiftIds }).strict();

export type BatchDeleteInput = z.input<typeof BatchDeleteInput>;
export type BatchDeleteResult = { hourly: number; production: number };

/**
 * Deletes several of the user's shifts at once. Ids that aren't theirs are
 * skipped. Returns how many of each kind were deleted, or null on bad input.
 */
export default async function onDeleteShiftsBatch(
  input: BatchDeleteInput
): Promise<BatchDeleteResult | null> {
  const user = await UserService.getSessionUser();
  if (!user?.id) return null;

  const parsed = BatchDeleteInput.safeParse(input);
  if (!parsed.success) return null;

  const { ids } = parsed.data;
  const userId = user.id;

  try {
    const [hourly, production] = await prisma.$transaction([
      prisma.hourly.deleteMany({ where: { id: { in: ids.hourly }, shift: { userId } } }),
      prisma.production.deleteMany({ where: { id: { in: ids.production }, shift: { userId } } }),
    ]);

    revalidateShiftPages();

    return { hourly: hourly.count, production: production.count };
  } catch (error) {
    // eslint-disable-next-line no-console -- server log for failed deletes
    console.error("[delete-shifts-batch]", error);
    return null;
  }
}

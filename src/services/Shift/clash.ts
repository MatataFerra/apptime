import { overlaps } from "@/utils/helpers/batchShifts";

import prisma from "#/prisma/client";

/**
 * Whether a new shift would share time with one the user already saved
 * (hourly or production). Two jobs the same day are fine; the same hours
 * twice are not. Dates are stored as text, so the spans are compared here.
 */
export async function clashesWithSaved(
  shiftId: number,
  span: { startDate: string; endDate: string }
) {
  const select = { startDate: true, endDate: true } as const;
  const [hourly, production] = await Promise.all([
    prisma.hourly.findMany({ where: { shiftId }, select }),
    prisma.production.findMany({ where: { shiftId }, select }),
  ]);
  return [...hourly, ...production].some((other) => overlaps(span, other));
}

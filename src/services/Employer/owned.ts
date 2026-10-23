import { z } from "zod";

import prisma from "#/prisma/client";

const EmployerIdSchema = z.number().int().positive();

/**
 * The employer a shift may point at, checked against its owner.
 *
 * - `undefined`: not sent, leave the shift's employer as it is.
 * - `null`: no employer.
 * - a number: it must be one of `userId`'s employers (archived ones too, so
 *   old shifts keep theirs). Someone else's id, or garbage, is `false`.
 */
export async function ownEmployerId(
  userId: string,
  employerId: unknown
): Promise<number | null | undefined | false> {
  if (employerId === undefined) return undefined;
  if (employerId === null) return null;

  const parsed = EmployerIdSchema.safeParse(employerId);
  if (!parsed.success) return false;

  const owned = await prisma.employer.findFirst({
    where: { id: parsed.data, userId },
    select: { id: true },
  });

  return owned ? owned.id : false;
}

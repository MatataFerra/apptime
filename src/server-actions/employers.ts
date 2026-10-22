"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { type EmployerInput, EmployerInputSchema, fieldErrors } from "@/services/Employer/schema";

import { getSession } from "@/utils/auth/session";
import { EMPLOYERS_PAGE } from "@/utils/helpers/revalidateShiftPages";

import prisma from "#/prisma/client";

const IdSchema = z.number().int().positive();

async function sessionUserId() {
  return (await getSession())?.user.id ?? null;
}

function revalidate() {
  revalidatePath(EMPLOYERS_PAGE, "page");
}

/** Adds an employer for the signed-in user. */
export async function onCreateEmployer(input: EmployerInput) {
  const userId = await sessionUserId();
  if (!userId) return { ok: false as const, error: "Not signed in" };

  const parsed = EmployerInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Check the form", fields: fieldErrors(parsed.error) };
  }

  const employer = await prisma.employer.create({ data: { ...parsed.data, userId } });
  revalidate();
  return { ok: true as const, id: employer.id };
}

/** Edits one of the signed-in user's employers. */
export async function onUpdateEmployer(id: number, input: EmployerInput) {
  const userId = await sessionUserId();
  if (!userId) return { ok: false as const, error: "Not signed in" };
  if (!IdSchema.safeParse(id).success) return { ok: false as const, error: "Not found" };

  const parsed = EmployerInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Check the form", fields: fieldErrors(parsed.error) };
  }

  // Filtered by owner: someone else's id is "not found".
  const { count } = await prisma.employer.updateMany({
    where: { id, userId, archived: false },
    data: parsed.data,
  });
  if (count === 0) return { ok: false as const, error: "Not found" };

  revalidate();
  return { ok: true as const };
}

/**
 * Removes an employer. Shifts can't point at one yet, so it's deleted;
 * once they can, used ones will be archived instead.
 */
export async function onRemoveEmployer(id: number) {
  const userId = await sessionUserId();
  if (!userId) return { ok: false as const, error: "Not signed in" };
  if (!IdSchema.safeParse(id).success) return { ok: false as const, error: "Not found" };

  const { count } = await prisma.employer.deleteMany({ where: { id, userId } });
  if (count === 0) return { ok: false as const, error: "Not found" };

  revalidate();
  return { ok: true as const };
}

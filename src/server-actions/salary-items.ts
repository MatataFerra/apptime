"use server";

import { getServerSession } from "next-auth";
import { z } from "zod";

import { revalidateSettingsPage, revalidateShiftPages } from "@/utils/helpers/revalidateShiftPages";

import prisma from "#/prisma/client";

const Kind = z.enum(["tax", "contribution"]);
export type SalaryItemKind = z.infer<typeof Kind>;

const UpdateSchema = z
  .object({
    kind: Kind,
    id: z.number().int().positive(),
    name: z.string().trim().min(1).max(60),
    value: z.number().min(0).max(100),
    description: z.string().trim().max(200).nullable(),
  })
  .strict();

const RemoveSchema = z.object({ kind: Kind, id: z.number().int().positive() }).strict();

async function sessionUserId() {
  const email = (await getServerSession())?.user?.email;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return user?.id ?? null;
}

/** Both models have the same shape, so one delegate type covers them. */
function model(kind: SalaryItemKind) {
  return (kind === "tax" ? prisma.tax : prisma.contribution) as typeof prisma.tax;
}

function revalidate() {
  revalidateSettingsPage();
  revalidateShiftPages();
}

/**
 * Rename a tax or change its rate. Every shift that uses it shows the new
 * values, which is what the Settings screen warns about.
 */
export async function onUpdateSalaryItem(input: z.input<typeof UpdateSchema>) {
  const userId = await sessionUserId();
  if (!userId) return { ok: false as const, error: "Not signed in" };

  const parsed = UpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Check the name and rate" };
  const { kind, id, name, value, description } = parsed.data;

  // updateMany with userId in the filter: someone else's id updates nothing.
  const { count } = await model(kind).updateMany({
    where: { id, userId },
    data: { name, value, description: description || null },
  });
  if (count === 0) return { ok: false as const, error: "Not found" };

  revalidate();
  return { ok: true as const };
}

/**
 * Remove a tax from the picker. If shifts use it, it's archived so their
 * pay doesn't change; otherwise it's deleted.
 */
export async function onRemoveSalaryItem(input: z.input<typeof RemoveSchema>) {
  const userId = await sessionUserId();
  if (!userId) return { ok: false as const, error: "Not signed in" };

  const parsed = RemoveSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid item" };
  const { kind, id } = parsed.data;

  const item = await model(kind).findFirst({
    where: { id, userId },
    select: { _count: { select: { hourly: true, production: true } } },
  });
  if (!item) return { ok: false as const, error: "Not found" };

  const used = item._count.hourly + item._count.production > 0;
  if (used) {
    await model(kind).updateMany({ where: { id, userId }, data: { archived: true } });
  } else {
    await model(kind).deleteMany({ where: { id, userId } });
  }

  revalidate();
  return { ok: true as const, archived: used };
}

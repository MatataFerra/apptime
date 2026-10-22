"use server";

import { z } from "zod";

import SalaryItems, { startsOnOrAfter } from "@/services/SalaryItems";

import { getSessionUserId } from "@/utils/auth/session";
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
    /**
     * Without it the change applies to every shift (fixing a typo).
     * With it, only shifts from that day on get the new values; older
     * ones keep the old rate (a rate that changed by law, say).
     */
    from: z.string().datetime().nullable().optional(),
  })
  .strict();

const RemoveSchema = z.object({ kind: Kind, id: z.number().int().positive() }).strict();

async function sessionUserId() {
  const id = await getSessionUserId();
  if (!id) return null;
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
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
 * Rename a tax or change its rate, for every shift that uses it or only
 * for shifts from a date on.
 */
export async function onUpdateSalaryItem(input: z.input<typeof UpdateSchema>) {
  const userId = await sessionUserId();
  if (!userId) return { ok: false as const, error: "Not signed in" };

  const parsed = UpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Check the name and rate" };
  const { kind, id, name, value, from } = parsed.data;
  const description = parsed.data.description || null;

  // Filtered by owner: someone else's id is "not found".
  const current = await model(kind).findFirst({ where: { id, userId } });
  if (!current) return { ok: false as const, error: "Not found" };

  const sameRate = current.name === name && Number(current.value) === value;

  if (!from || sameRate) {
    await model(kind).update({ where: { id }, data: { name, value, description } });
    revalidate();
    return { ok: true as const, moved: null };
  }

  // From a date: shifts on or after it move to a row with the new values.
  const since = new Date(from);
  const target = await SalaryItems.findOrCreate(kind, userId, { name, value, description });
  const moving = (await SalaryItems.shiftsUsing(kind, userId, id)).filter((shift) =>
    startsOnOrAfter(shift.startDate, since)
  );

  if (target !== id && moving.length > 0) {
    await prisma.$transaction(
      moving.map((shift) => SalaryItems.relink(kind, shift.kind, shift.id, id, target))
    );
  }

  // The old row now only belongs to older shifts: keep it for them but stop
  // offering it, or delete it if nothing uses it anymore.
  if (target !== id) {
    if ((await SalaryItems.uses(kind, id)) === 0) {
      await model(kind).delete({ where: { id } });
    } else {
      await model(kind).update({ where: { id }, data: { archived: true } });
    }
  }

  revalidate();
  return { ok: true as const, moved: moving.length };
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

  const item = await model(kind).findFirst({ where: { id, userId }, select: { id: true } });
  if (!item) return { ok: false as const, error: "Not found" };

  const used = (await SalaryItems.uses(kind, id)) > 0;
  if (used) {
    await model(kind).updateMany({ where: { id, userId }, data: { archived: true } });
  } else {
    await model(kind).deleteMany({ where: { id, userId } });
  }

  revalidate();
  return { ok: true as const, archived: used };
}

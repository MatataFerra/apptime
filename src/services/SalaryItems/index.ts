import type { SalaryItemInput } from "@/types";

import prisma from "#/prisma/client";

export type SalaryItemKind = "tax" | "contribution";
export type ShiftKind = "hourly" | "production";

/** Tax and Contribution have the same shape, so one delegate type covers both. */
function items(kind: SalaryItemKind) {
  return (kind === "tax" ? prisma.tax : prisma.contribution) as typeof prisma.tax;
}

/** Hourly and Production share the fields used here. */
function shifts(kind: ShiftKind) {
  return (kind === "hourly" ? prisma.hourly : prisma.production) as typeof prisma.hourly;
}

/** Relation field on Hourly/Production for each kind of item. */
function relation(kind: SalaryItemKind) {
  return kind === "tax" ? "taxes" : "contributions";
}

/**
 * Rate changes move shifts to another row instead of editing the row they
 * use, so the shifts that shouldn't change keep their rate.
 */
const SalaryItems = {
  /** The user's row with this name and rate, created if needed (and restored if archived). */
  async findOrCreate(kind: SalaryItemKind, userId: string, item: SalaryItemInput) {
    const existing = await items(kind).findFirst({
      where: { userId, name: item.name, value: item.value },
      orderBy: { archived: "asc" },
    });

    if (existing) {
      if (existing.archived) {
        await items(kind).update({ where: { id: existing.id }, data: { archived: false } });
      }
      return existing.id;
    }

    const created = await items(kind).create({
      data: { userId, name: item.name, value: item.value, description: item.description },
    });
    return created.id;
  },

  /**
   * Points one shift from one row to another. Not awaited here, so several
   * can go in one prisma.$transaction.
   */
  relink(kind: SalaryItemKind, shiftKind: ShiftKind, shiftId: number, from: number, to: number) {
    return shifts(shiftKind).update({
      where: { id: shiftId },
      data: { [relation(kind)]: { disconnect: { id: from }, connect: { id: to } } },
      select: { id: true },
    });
  },

  /** The user's shifts that use the item, with their start date. */
  async shiftsUsing(kind: SalaryItemKind, userId: string, itemId: number) {
    const where = { shift: { userId }, [relation(kind)]: { some: { id: itemId } } };
    const select = { id: true, startDate: true } as const;
    const [hourly, production] = await Promise.all([
      prisma.hourly.findMany({ where, select }),
      prisma.production.findMany({ where, select }),
    ]);
    return [
      ...hourly.map((s) => ({ ...s, kind: "hourly" as const })),
      ...production.map((s) => ({ ...s, kind: "production" as const })),
    ];
  },

  async uses(kind: SalaryItemKind, itemId: number) {
    const row = await items(kind).findUnique({
      where: { id: itemId },
      // Not `_count`: on Turso a zero count comes back as NULL and Prisma 5 throws.
      select: { hourly: { select: { id: true } }, production: { select: { id: true } } },
    });
    return row ? row.hourly.length + row.production.length : 0;
  },

  items,
};

/** Shifts store their start as a Date string; anything unparseable counts as old. */
export function startsOnOrAfter(startDate: string, from: Date) {
  const start = new Date(startDate);
  return !isNaN(start.valueOf()) && start.valueOf() >= from.valueOf();
}

export default SalaryItems;

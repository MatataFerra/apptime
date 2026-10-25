"use server";

import type { Tax } from "@prisma/client";
import omit from "lodash/omit";
import { z } from "zod";

import { ownEmployerId } from "@/services/Employer/owned";
import SalaryItems from "@/services/SalaryItems";
import ShiftService from "@/services/Shift";
import { ShiftRecord } from "@/services/Shift/server";
import UserService from "@/services/User";

import type { HourlyType, ProductionType } from "@/types";

import prisma from "#/prisma/client";

/** A new rate for one of the shift's taxes, for this shift only. */
export type TaxRateChange = { id: number; value: number };

const RateChanges = z
  .array(z.object({ id: z.number().int().positive(), value: z.number().min(0).max(100) }).strict())
  .max(20);

export default async function onEditShift(
  data: ProductionType | HourlyType,
  taxes?: Tax[] | null,
  rateChanges?: TaxRateChange[] | null
) {
  const currentUser = await UserService.getSessionOwner();

  if (!currentUser?.shifts?.id) {
    return null;
  }

  const changes = RateChanges.safeParse(rateChanges ?? []);
  if (!changes.success) return null;

  const shiftKind = ShiftService.isProductionShift(data) ? "production" : "hourly";
  const userId = currentUser.id;

  try {
    // Only the user's own shift can be edited, and it stays theirs.
    const query = {
      where: { id: data.id, shift: { userId } },
      select: { id: true, taxes: { select: { id: true, name: true, description: true } } },
    };
    const owned =
      shiftKind === "production"
        ? await prisma.production.findFirst(query)
        : await prisma.hourly.findFirst(query);
    if (!owned) return null;

    const employerId = await ownEmployerId(userId, data.employerId);
    if (employerId === false) return null;

    const buildShift = new ShiftService({
      ...omit(data, ["employer", "employerId"]),
      ...(employerId !== undefined && { employerId }),
      shiftId: currentUser.shifts.id,
    })
      .checkPublicHoliday()
      .differenceInMinsBetweenStartAndEnd()
      .closeShift()
      .build();

    const updateShift = await new ShiftRecord(buildShift).update(data.id, {
      deleteTaxes: taxes ?? [],
    });

    // A rate changed here only applies to this shift: it moves to a tax
    // with the new rate and the original stays as it is for the others.
    const removed = new Set((taxes ?? []).map((tax) => tax.id));
    const relinks = [];
    for (const change of changes.data) {
      const tax = owned.taxes.find((t) => t.id === change.id);
      if (!tax || removed.has(tax.id)) continue;
      const target = await SalaryItems.findOrCreate("tax", userId, {
        name: tax.name,
        value: change.value,
        description: tax.description,
      });
      if (target !== tax.id) {
        relinks.push(SalaryItems.relink("tax", shiftKind, data.id, tax.id, target));
      }
    }
    if (relinks.length > 0) await prisma.$transaction(relinks);

    return updateShift;
  } catch (error) {
    // eslint-disable-next-line no-console -- server log for failed saves
    console.error("[edit-shift]", error);
    return null;
  }
}

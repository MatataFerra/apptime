"use server";

import type { Tax } from "@prisma/client";
import { z } from "zod";

import { ownEmployerId } from "@/services/Employer/owned";
import SalaryItems from "@/services/SalaryItems";
import ShiftService from "@/services/Shift";
import { HourlyRecord, ProductionRecord } from "@/services/Shift/server";
import UserService from "@/services/User";

import type { HourlyType, ProductionType } from "@/types";

import { isProductionShift } from "@/utils/helpers/isProductionShift";

import prisma from "#/prisma/client";

/** A new rate for one of the shift's taxes, for this shift only. */
export type TaxRateChange = { id: number; value: number };

/*
 * What an edit can change. Everything else on the shift (its id, container,
 * holiday rate, source, taxes…) is the server's: unknown keys are dropped.
 */
const EditableShift = {
  id: z.number().int().positive(),
  name: z.string().max(120).nullish(),
  startDate: z.string().min(1).max(100),
  endDate: z.string().max(100).nullish(),
  notes: z.string().max(2000).nullish(),
  isPublicHoliday: z.boolean().optional(),
  publicHolidayWorked: z.boolean().optional(),
  currency: z.string().max(8).nullish(),
  employerId: z.number().int().positive().nullish(),
};
const HourlyEdit = z.object({
  ...EditableShift,
  hourValue: z.number().min(0),
  unpaidBreaks: z.number().min(0).nullish(),
});
const ProductionEdit = z.object({
  ...EditableShift,
  itemValue: z.number().min(0).nullish(),
  itemQuantity: z.number().min(0).nullish(),
});

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

  // Decided once and used for both the ownership check and the write. (The
  // shift services each had their own test, so an itemValue of 0 or null
  // checked a production shift and then wrote the hourly row with that id.)
  const shiftKind = isProductionShift(data as never) ? "production" : "hourly";
  const parsed = (shiftKind === "production" ? ProductionEdit : HourlyEdit).safeParse(data);
  if (!parsed.success) return null;
  const { id, employerId: askedEmployer, ...fields } = parsed.data;
  const userId = currentUser.id;

  try {
    // Only the user's own shift can be edited, and it stays theirs.
    const query = {
      where: { id, shift: { userId } },
      select: { id: true, taxes: { select: { id: true, name: true, description: true } } },
    };
    const owned =
      shiftKind === "production"
        ? await prisma.production.findFirst(query)
        : await prisma.hourly.findFirst(query);
    if (!owned) return null;

    const employerId = await ownEmployerId(userId, askedEmployer);
    if (employerId === false) return null;

    const buildShift = new ShiftService({
      ...fields,
      ...(employerId !== undefined && { employerId }),
      shiftId: currentUser.shifts.id,
    } as never)
      .checkPublicHoliday()
      .differenceInMinsBetweenStartAndEnd()
      .closeShift()
      .build();

    const options = { deleteTaxes: taxes ?? [] };
    const updateShift =
      shiftKind === "production"
        ? await new ProductionRecord(buildShift as ProductionType, options).update(owned.id)
        : await new HourlyRecord(buildShift as HourlyType, options).update(owned.id);

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
        relinks.push(SalaryItems.relink("tax", shiftKind, owned.id, tax.id, target));
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

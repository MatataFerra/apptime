"use server";

import type { Hourly } from "@prisma/client";
import { differenceInMinutes, isValid } from "date-fns";
import { z } from "zod";

import ContributionService from "@/services/Contribution";
import { ownEmployerId } from "@/services/Employer/owned";
import ShiftService from "@/services/Shift";
import TaxService from "@/services/Tax";
import UserService from "@/services/User";

import { MAX_BATCH_DAYS, MAX_SHIFT_MINUTES, overlaps } from "@/utils/helpers/batchShifts";
import { revalidateShiftPages } from "@/utils/helpers/revalidateShiftPages";

import prisma from "#/prisma/client";

const DateString = z.string().refine((value) => isValid(new Date(value)), "invalid date");

const SalaryItem = z.object({
  name: z.string(),
  value: z.number(),
  description: z.string().nullable(),
});

const BatchSchema = z.object({
  name: z.string().nullable(),
  hourValue: z.number().min(0),
  unpaidBreaks: z.number().min(0),
  currency: z.string().nullable().optional(),
  employerId: z.unknown().optional(),
  taxes: z.array(SalaryItem),
  contributions: z.array(SalaryItem),
  shifts: z
    .array(
      z.object({ startDate: DateString, endDate: DateString }).refine(({ startDate, endDate }) => {
        const minutes = differenceInMinutes(new Date(endDate), new Date(startDate));
        return minutes > 0 && minutes <= MAX_SHIFT_MINUTES;
      }, "invalid duration")
    )
    .min(1)
    .max(MAX_BATCH_DAYS),
});

export type HourlyBatchInput = z.infer<typeof BatchSchema>;

export type HourlyBatchResult = {
  created: number;
  /** Shifts left out because they run into one already saved (or into each other). */
  skipped: { startDate: string; endDate: string }[];
};

/** Only items with a name and a rate are saved, as in a single Fast charge. */
function salaryItems(items: HourlyBatchInput["taxes"]) {
  return items
    .filter((item) => item.name && item.value)
    .map(({ name, value, description }) => ({ name, value, description }));
}

/**
 * Saves several hourly shifts that share everything but their dates.
 * Days that overlap a saved shift are skipped, never doubled.
 */
export default async function onCreateHourlyBatch(
  input: HourlyBatchInput
): Promise<HourlyBatchResult | null> {
  const parsed = BatchSchema.safeParse(input);
  if (!parsed.success) return null;
  const data = parsed.data;

  const currentUser = await UserService.getSessionUser({
    shifts: true,
    profile: false,
    config: false,
  });
  const shiftId = currentUser?.shifts?.id;
  if (!currentUser || !shiftId) return null;

  // Someone else's employer is refused, not silently dropped.
  const employerId = await ownEmployerId(currentUser.id, data.employerId ?? null);
  if (employerId === false) return null;

  try {
    const span = { startDate: true, endDate: true } as const;
    const [hourly, production] = await Promise.all([
      prisma.hourly.findMany({ where: { shiftId }, select: span }),
      prisma.production.findMany({ where: { shiftId }, select: span }),
    ]);

    const taken: { startDate: string; endDate: string | null }[] = [...hourly, ...production];
    const accepted: HourlyBatchInput["shifts"] = [];
    const skipped: HourlyBatchResult["skipped"] = [];

    for (const shift of data.shifts) {
      if (taken.some((other) => overlaps(shift, other))) {
        skipped.push(shift);
        continue;
      }
      accepted.push(shift);
      taken.push(shift);
    }

    if (accepted.length === 0) return { created: 0, skipped };

    // Resolved once for the whole batch: every shift shares the same rows.
    const [taxes, contributions] = await Promise.all([
      new TaxService(salaryItems(data.taxes), currentUser.id).create(),
      new ContributionService(salaryItems(data.contributions), currentUser.id).create(),
    ]);

    const rows = accepted.map((shift) =>
      new ShiftService({
        startDate: shift.startDate,
        endDate: shift.endDate,
        name: data.name?.trim() || null,
        isPublicHoliday: false,
        publicHolidayWorked: false,
        hourValue: data.hourValue,
        amount: 0,
        isClosed: true,
        notes: "",
        unpaidBreaks: data.unpaidBreaks,
        shiftId,
        currency: data.currency ?? null,
        employerId: employerId ?? null,
        source: "fast",
      })
        .closeShift()
        .differenceInMinsBetweenStartAndEnd()
        .build<Hourly>()
    );

    // All or nothing: a half-saved batch would be hard to spot and fix.
    await prisma.$transaction(
      rows.map((row) =>
        prisma.hourly.create({
          data: {
            ...row,
            taxes: { connect: taxes },
            contributions: { connect: contributions },
          },
          select: { id: true },
        })
      )
    );

    revalidateShiftPages();

    return { created: rows.length, skipped };
  } catch (error) {
    // eslint-disable-next-line no-console -- server log for failed saves
    console.error("[hourly-batch]", error);
    return null;
  }
}

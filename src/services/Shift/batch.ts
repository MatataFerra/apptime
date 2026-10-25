import type { Prisma } from "@prisma/client";
import { differenceInMinutes, isValid } from "date-fns";
import { z } from "zod";

import ContributionService from "@/services/Contribution";
import { ownEmployerId } from "@/services/Employer/owned";
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

/** One shift of a batch: its dates, positive and no longer than a day. */
export const BatchShiftDates = z.object({ startDate: DateString, endDate: DateString });

function validDuration({ startDate, endDate }: { startDate: string; endDate: string }) {
  const minutes = differenceInMinutes(new Date(endDate), new Date(startDate));
  return minutes > 0 && minutes <= MAX_SHIFT_MINUTES;
}

/** What every batch shares: name, employer, currency, taxes; plus 1–62 shifts of `shift`. */
export function batchSchema<
  Fields extends z.ZodRawShape,
  Shift extends z.ZodType<{ startDate: string; endDate: string }>,
>(fields: Fields, shift: Shift) {
  return z.object({
    name: z.string().nullable(),
    currency: z.string().nullable().optional(),
    employerId: z.unknown().optional(),
    taxes: z.array(SalaryItem),
    contributions: z.array(SalaryItem),
    ...fields,
    shifts: z.array(shift.refine(validDuration, "invalid duration")).min(1).max(MAX_BATCH_DAYS),
  });
}

type ShiftDates = { startDate: string; endDate: string };

export type BatchResult<S extends ShiftDates = ShiftDates> = {
  created: number;
  /** Shifts left out because they run into one already saved (or into each other). */
  skipped: S[];
};

type Common = {
  name: string | null;
  currency?: string | null;
  employerId?: unknown;
  taxes: z.infer<typeof SalaryItem>[];
  contributions: z.infer<typeof SalaryItem>[];
};

type Context = {
  shiftId: number;
  employerId: number | null;
};

type Model = "hourly" | "production";

/** Only items with a name and a rate are saved, as in a single shift. */
function salaryItems(items: Common["taxes"]) {
  return items
    .filter((item) => item.name && item.value)
    .map(({ name, value, description }) => ({ name, value, description }));
}

/**
 * Saves several shifts at once for the signed-in user, all or nothing.
 * Shifts that overlap a saved one (hourly or production), or an earlier one in
 * the batch, are skipped. Taxes and contributions are resolved once and shared.
 * `row` builds the columns of one shift for `model`.
 *
 * Every statement is a round trip to Turso, so the shifts go in with one
 * multi-row insert and each tax or contribution is linked to all of them in
 * one update, instead of one insert (plus its links) per shift: a few
 * statements whatever the number of days.
 */
export async function saveBatch<D extends Common & { shifts: S[] }, S extends ShiftDates>({
  input,
  schema,
  tag,
  model,
  row,
}: {
  input: unknown;
  schema: z.ZodType<D>;
  tag: string;
  model: Model;
  row: (shift: S, data: D, ctx: Context) => Record<string, unknown>;
}): Promise<BatchResult<S> | null> {
  const parsed = schema.safeParse(input);
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
    const accepted: S[] = [];
    const skipped: S[] = [];

    for (const shift of data.shifts) {
      if (taken.some((other) => overlaps(shift, other))) {
        skipped.push(shift);
        continue;
      }
      accepted.push(shift);
      taken.push(shift);
    }

    if (accepted.length === 0) return { created: 0, skipped };

    const [taxes, contributions] = await Promise.all([
      new TaxService(salaryItems(data.taxes), currentUser.id).create(),
      new ContributionService(salaryItems(data.contributions), currentUser.id).create(),
    ]);

    const ctx: Context = { shiftId, employerId: employerId ?? null };
    const rows = accepted.map((shift) => row(shift, data, ctx));

    // All or nothing: a half-saved batch would be hard to spot and fix.
    await prisma.$transaction(async (tx) => {
      const created =
        model === "hourly"
          ? await tx.hourly.createManyAndReturn({
              data: rows as Prisma.HourlyCreateManyInput[],
              select: { id: true },
            })
          : await tx.production.createManyAndReturn({
              data: rows as Prisma.ProductionCreateManyInput[],
              select: { id: true },
            });
      const link = { [model]: { connect: created.map(({ id }) => ({ id })) } };

      for (const { id } of taxes) {
        await tx.tax.update({ where: { id }, data: link, select: { id: true } });
      }
      for (const { id } of contributions) {
        await tx.contribution.update({ where: { id }, data: link, select: { id: true } });
      }
    });

    revalidateShiftPages();

    return { created: accepted.length, skipped };
  } catch (error) {
    // eslint-disable-next-line no-console -- server log for failed saves
    console.error(`[${tag}]`, error);
    return null;
  }
}

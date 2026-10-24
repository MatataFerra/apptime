"use server";

import type { Hourly } from "@prisma/client";
import { z } from "zod";

import ShiftService from "@/services/Shift";
import { type BatchResult, batchSchema, BatchShiftDates, saveBatch } from "@/services/Shift/batch";

import prisma from "#/prisma/client";

const HourlyBatchSchema = batchSchema(
  { hourValue: z.number().min(0), unpaidBreaks: z.number().min(0) },
  BatchShiftDates
);

export type HourlyBatchInput = z.infer<typeof HourlyBatchSchema>;
export type HourlyBatchResult = BatchResult;

/**
 * Saves several hourly shifts that share everything but their dates.
 * Days that overlap a saved shift are skipped, never doubled.
 */
export default async function onCreateHourlyBatch(
  input: HourlyBatchInput
): Promise<HourlyBatchResult | null> {
  return saveBatch({
    input,
    schema: HourlyBatchSchema,
    tag: "hourly-batch",
    create: (shift, data, { shiftId, employerId, connect }) => {
      const row = new ShiftService({
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
        employerId,
        source: "fast",
      })
        .closeShift()
        .differenceInMinsBetweenStartAndEnd()
        .build<Hourly>();

      return prisma.hourly.create({ data: { ...row, ...connect }, select: { id: true } });
    },
  });
}

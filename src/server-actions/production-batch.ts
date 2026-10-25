"use server";

import type { Production } from "@prisma/client";
import { z } from "zod";

import ShiftService from "@/services/Shift";
import { type BatchResult, batchSchema, BatchShiftDates, saveBatch } from "@/services/Shift/batch";

const ProductionBatchSchema = batchSchema(
  { itemValue: z.number().min(0) },
  // Bins, boxes or pieces change from day to day: each shift brings its own.
  BatchShiftDates.extend({ itemQuantity: z.number().min(0) })
);

export type ProductionBatchInput = z.infer<typeof ProductionBatchSchema>;
export type ProductionBatchResult = BatchResult<ProductionBatchInput["shifts"][number]>;

/**
 * Saves several production shifts with the same hours and rate, each with its
 * own quantity. Days that overlap a saved shift are skipped, never doubled.
 */
export default async function onCreateProductionBatch(
  input: ProductionBatchInput
): Promise<ProductionBatchResult | null> {
  return saveBatch({
    input,
    schema: ProductionBatchSchema,
    tag: "production-batch",
    model: "production",
    row: (shift, data, { shiftId, employerId }) =>
      new ShiftService({
        startDate: shift.startDate,
        endDate: shift.endDate,
        name: data.name?.trim() || null,
        itemValue: data.itemValue,
        itemQuantity: shift.itemQuantity,
        isPublicHoliday: false,
        publicHolidayWorked: false,
        currency: data.currency ?? null,
        employerId,
        amount: 0,
        isClosed: true,
        notes: "",
        shiftId,
      })
        .closeShift()
        .differenceInMinsBetweenStartAndEnd()
        .build<Production>(),
  });
}

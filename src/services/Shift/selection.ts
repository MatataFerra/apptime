import { z } from "zod";

import type { ShiftKind } from "@/services/History";

/** The most shifts one batch edit or delete may touch. */
export const MAX_BATCH_SHIFTS = 500;

const Ids = z.array(z.number().int().positive()).max(MAX_BATCH_SHIFTS);

/** Selected shifts, by kind: hourly and per piece ids can repeat across kinds. */
export const BatchShiftIds = z
  .object({ hourly: Ids, production: Ids })
  .strict()
  .refine(({ hourly, production }) => hourly.length + production.length > 0)
  .refine(({ hourly, production }) => hourly.length + production.length <= MAX_BATCH_SHIFTS);

export type BatchShiftIdsType = z.infer<typeof BatchShiftIds>;

/** "hourly-12": a shift's key in a selection. */
export type SelectionKey = `${ShiftKind}-${number}`;

export function selectionKey(kind: ShiftKind, id: number): SelectionKey {
  return `${kind}-${id}`;
}

/** The selected keys split into the ids of each kind, as the batch actions take them. */
export function idsByKind(keys: Iterable<string>): BatchShiftIdsType {
  const ids: BatchShiftIdsType = { hourly: [], production: [] };
  for (const key of keys) {
    const [kind, raw] = key.split("-");
    const id = Number(raw);
    if ((kind === "hourly" || kind === "production") && Number.isInteger(id) && id > 0) {
      ids[kind].push(id);
    }
  }
  return ids;
}

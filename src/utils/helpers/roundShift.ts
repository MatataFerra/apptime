/** Minute steps a tracked shift can be rounded to (0 = exact). */
export const ROUND_STEPS = [0, 5, 15] as const;
export type RoundStep = (typeof ROUND_STEPS)[number];

/** A date rounded to the nearest `step` minutes (08:07 → 08:05 or 08:00). */
export function roundToStep(date: Date, step: number) {
  if (!step || step <= 0) return new Date(date);
  const ms = step * 60_000;
  return new Date(Math.round(date.getTime() / ms) * ms);
}

/**
 * Start and finish of a tracked shift rounded to `step` minutes. When the
 * shift is so short that rounding would leave no time at all, it stays exact.
 */
export function roundShiftTimes(start: Date, end: Date, step: number) {
  if (!step || step <= 0 || isNaN(start.valueOf()) || isNaN(end.valueOf())) {
    return { start, end };
  }
  const roundedStart = roundToStep(start, step);
  const roundedEnd = roundToStep(end, step);
  if (roundedEnd <= roundedStart) return { start, end };
  return { start: roundedStart, end: roundedEnd };
}

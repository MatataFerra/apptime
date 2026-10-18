import { addHours, format, isSameDay } from "date-fns";

/**
 * Suggested finish for a shift that starts at `start`
 * (`yyyy-MM-dd'T'HH:mm`, as in a datetime-local input): the same day,
 * `hours` later, never past 23:59.
 */
export function defaultFinish(start: string, hours = 8) {
  const startDate = new Date(start);
  if (isNaN(startDate.valueOf())) return "";

  const later = addHours(startDate, hours);
  const end = isSameDay(later, startDate) ? later : new Date(startDate.setHours(23, 59, 0, 0));

  return format(end, "yyyy-MM-dd'T'HH:mm");
}

/** True when the finish is missing, before the start or on another day. */
export function needsDefaultFinish(start: string, finish?: string | null) {
  if (!finish) return true;
  const s = new Date(start);
  const f = new Date(finish);
  if (isNaN(f.valueOf())) return true;
  return f < s || !isSameDay(s, f);
}

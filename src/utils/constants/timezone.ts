/**
 * The browser's IANA time zone ("Pacific/Auckland"), saved by TimeZoneSync
 * so server components can tell which day it is for the user.
 */
export const TIME_ZONE_COOKIE = "tz";

export function isTimeZone(value: unknown): value is string {
  if (typeof value !== "string" || !value || value.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

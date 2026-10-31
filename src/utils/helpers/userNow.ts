import { cache } from "react";

import { cookies, headers } from "next/headers";

import { isTimeZone, TIME_ZONE_COOKIE } from "@/utils/constants/timezone";

import "server-only";

/**
 * The user's time zone on the server: the cookie TimeZoneSync sets, else
 * Vercel's guess from the IP (first visit), else UTC.
 */
export const getUserTimeZone = cache(async () => {
  const saved = (await cookies()).get(TIME_ZONE_COOKIE)?.value;
  if (isTimeZone(saved)) return saved;
  const fromIp = (await headers()).get("x-vercel-ip-timezone");
  return isTimeZone(fromIp) ? fromIp : "UTC";
});

/**
 * `now` as the user's wall clock, built in the server's own zone: its
 * year, month, day, hour and minute are the ones the user sees, so
 * date-fns (format, startOfWeek…) on the server gives the user's day.
 */
export function wallClock(timeZone: string, now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((part) => [part.type, Number(part.value)])
  );
  return new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
}

/** Now, as the user's clock reads it (see wallClock). Once per request. */
export const getUserNow = cache(async () => wallClock(await getUserTimeZone()));

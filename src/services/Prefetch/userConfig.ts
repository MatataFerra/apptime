import { cache } from "react";

import { getSessionUserId } from "@/utils/auth/session";

import "server-only";

import prisma from "#/prisma/client";

/**
 * The Settings that decide how dates read (week start, date order, clock)
 * for server components. One small query per request, shared.
 */
export const getUserDateConfig = cache(async () => {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return prisma.config
    .findUnique({
      where: { userId },
      select: { weekStartsOn: true, dateFormat: true, timeFormat: true },
    })
    .catch(() => null);
});

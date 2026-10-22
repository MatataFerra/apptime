import "server-only";

import prisma from "#/prisma/client";

export type RateLimitRule = {
  /** Window length in seconds. */
  window: number;
  /** Requests allowed per window. */
  max: number;
};

/**
 * Counts one request for `key` and says whether it's within `rule`. Fixed
 * window, stored in ActionRateLimit so it holds across server instances.
 *
 * For server actions that call Better Auth with auth.api: those calls skip
 * Better Auth's own limiter, which only runs on HTTP requests.
 */
export async function consumeRateLimit(key: string, rule: RateLimitRule) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - rule.window * 1000);

  // Inside the window and under the max: count it. One statement, so two
  // requests at once can't both take the last slot.
  const { count } = await prisma.actionRateLimit.updateMany({
    where: { key, windowStart: { gt: windowStart }, count: { lt: rule.max } },
    data: { count: { increment: 1 } },
  });
  if (count === 1) return true;

  const row = await prisma.actionRateLimit.findUnique({ where: { key } });

  // In the window with no slots left.
  if (row && row.windowStart > windowStart) return false;

  // No row yet, or the window ended: start a new one.
  await prisma.actionRateLimit.upsert({
    where: { key },
    create: { key, count: 1, windowStart: now },
    update: { count: 1, windowStart: now },
  });
  return true;
}

/**
 * The client's IP: the first x-forwarded-for entry. On Vercel that header
 * is set by the platform, which overwrites any value the client sends.
 */
export function clientIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

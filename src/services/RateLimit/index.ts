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

  // Every step is a single conditional write, so requests arriving together
  // can't all pass: only one of them opens (or reopens) the window, the rest
  // compete for the slots left in it.

  // Inside the window and under the max: take a slot.
  async function takeSlot() {
    const { count } = await prisma.actionRateLimit.updateMany({
      where: { key, windowStart: { gt: windowStart }, count: { lt: rule.max } },
      data: { count: { increment: 1 } },
    });
    return count === 1;
  }
  if (await takeSlot()) return true;

  // The window ended: restart it, only if nobody else just did.
  const { count: reopened } = await prisma.actionRateLimit.updateMany({
    where: { key, windowStart: { lte: windowStart } },
    data: { count: 1, windowStart: now },
  });
  if (reopened === 1) return true;

  // No row yet: create it. If another request created it first, the key
  // is taken; go back to competing for a slot in that window.
  try {
    await prisma.actionRateLimit.create({ data: { key, count: 1, windowStart: now } });
    return true;
  } catch (error) {
    if (!isUniqueViolation(error)) throw error;
  }
  return takeSlot();
}

function isUniqueViolation(error: unknown) {
  return (error as { code?: string } | null)?.code === "P2002";
}

/**
 * The client's IP: the first x-forwarded-for entry. On Vercel that header
 * is set by the platform, which overwrites any value the client sends.
 */
export function clientIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

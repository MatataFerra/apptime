import { type Checker, createChecker } from "disposable-check";
import { z } from "zod";

import "server-only";

/**
 * Temporary inboxes (10minutemail, mailinator, yopmail…) can't sign up.
 * disposable-check's list, subdomains included, plus the CMS's own rules
 * (Reglas de dominios), fetched from its /api/blocklist: the same list and
 * rules the CMS scans existing users with. Invalid addresses count too.
 *
 * The CMS is optional: without CMS_BLOCKLIST_URL and CMS_BLOCKLIST_TOKEN, or
 * when it doesn't answer, sign up uses the built-in list (and the last rules
 * it got), so a CMS outage never blocks sign ups.
 */

/** How long the CMS's rules are reused before asking again. */
export const BLOCKLIST_REFRESH_MS = 5 * 60 * 1000;
/** After a failed fetch, the next try waits this long. */
const RETRY_MS = 60 * 1000;
/** Sign up waits at most this long for the CMS. */
const TIMEOUT_MS = 2000;

const blocklist = z.object({
  block: z.array(z.string()),
  allow: z.array(z.string()),
});
export type Blocklist = z.infer<typeof blocklist>;

export function checkerFrom(rules: Blocklist | null): Checker {
  return createChecker(rules ?? {});
}

export function isDisposableWith(checker: Checker, email: string) {
  const { verdict } = checker.checkEmail(email.trim());
  return verdict === "disposable" || verdict === "invalid";
}

let cache: { checker: Checker; nextFetch: number } | null = null;

async function fetchBlocklist(): Promise<Blocklist | null> {
  const url = process.env.CMS_BLOCKLIST_URL;
  const token = process.env.CMS_BLOCKLIST_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return blocklist.parse(await res.json());
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[blocklist] CMS unavailable, using the built-in list:", error);
    return null;
  }
}

async function currentChecker(now = Date.now()) {
  if (cache && now < cache.nextFetch) return cache.checker;
  const configured = !!(process.env.CMS_BLOCKLIST_URL && process.env.CMS_BLOCKLIST_TOKEN);
  const rules = configured ? await fetchBlocklist() : null;
  if (rules) {
    cache = { checker: checkerFrom(rules), nextFetch: now + BLOCKLIST_REFRESH_MS };
  } else {
    // Keep the last rules we got; retry soon if the CMS failed.
    cache = {
      checker: cache?.checker ?? checkerFrom(null),
      nextFetch: now + (configured ? RETRY_MS : BLOCKLIST_REFRESH_MS),
    };
  }
  return cache.checker;
}

export async function isDisposableEmail(email: string) {
  return isDisposableWith(await currentChecker(), email);
}

import { cache } from "react";

import { headers } from "next/headers";

import { isVerificationOverdue } from "@/services/Auth/verification";

import { auth } from "@/utils/auth";

import "server-only";

/**
 * The session, unless the account is past its grace period without
 * confirming its email: then it's treated as signed out everywhere except
 * the "confirm your email" page (getSessionIncludingUnverified).
 */
async function usableSession(requestHeaders: Headers) {
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session || !isVerificationOverdue(session.user)) return session;
  // The cookie cache can be up to 2 minutes old: the email may have just
  // been confirmed. Check the database before restricting.
  const fresh = await auth.api.getSession({
    headers: requestHeaders,
    query: { disableCookieCache: true },
  });
  return fresh && !isVerificationOverdue(fresh.user) ? fresh : null;
}

/**
 * The signed-in session on the server (server components, server actions,
 * route handlers). Read from the signed session cookie cache, so it
 * usually doesn't hit the database. Memoized per request, so layouts and
 * server components can each ask for it.
 */
export const getSession = cache(async () => usableSession(await headers()));

/** Session for a route handler's request. */
export async function getRequestSession(req: Request) {
  return usableSession(req.headers);
}

/**
 * The session even for an account restricted for not confirming its
 * email. Only for the "confirm your email" page.
 */
export async function getSessionIncludingUnverified() {
  return auth.api.getSession({ headers: await headers() });
}

/**
 * Id of the user signed in on this request, or null. Route handlers must
 * check it themselves: the proxy doesn't run on /api.
 */
export async function getRequestUserId(req: Request) {
  return (await getRequestSession(req))?.user.id ?? null;
}

/** What the client gets about the session (no tokens). */
export type ClientSession = {
  user: { id: string; email: string; name: string; image: string | null; role: string };
} | null;

export function toClientSession(session: Awaited<ReturnType<typeof getSession>>): ClientSession {
  if (!session) return null;
  const { id, email, name, image, role } = session.user;
  return { user: { id, email, name, image: image ?? null, role: role ?? "USER" } };
}

/**
 * Id of the signed-in user, or null. Look users up by id, not by email: the
 * id never changes, while the email in the 5-minute session cookie cache
 * can be stale right after the user changes it.
 */
export async function getSessionUserId() {
  return (await getSession())?.user.id ?? null;
}

import { headers } from "next/headers";

import { auth } from "@/utils/auth";

import "server-only";

/**
 * The signed-in session on the server (server components, server actions,
 * route handlers). Read from the signed session cookie cache, so it
 * usually doesn't hit the database.
 */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Session for a route handler's request. */
export async function getRequestSession(req: Request) {
  return auth.api.getSession({ headers: req.headers });
}

/**
 * Id of the user signed in on this request, or null. Route handlers must
 * check it themselves: the proxy doesn't run on /api.
 */
export async function getRequestUserId(req: Request) {
  return (await getRequestSession(req))?.user.id ?? null;
}

/** Email of the signed-in user, or null. */
export async function getSessionEmail() {
  return (await getSession())?.user.email ?? null;
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

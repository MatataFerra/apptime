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

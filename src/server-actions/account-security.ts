"use server";

import { headers } from "next/headers";

import PasswordService from "@/services/Auth/password";

import type { ActionResult } from "@/types/i18n";

import { auth } from "@/utils/auth";
import { getSession } from "@/utils/auth/session";

import prisma from "#/prisma/client";

/** A signed-in device, without its token. */
export type ActiveSession = {
  id: string;
  userAgent: string | null;
  createdAt: string;
  /** Last time the session was refreshed (about once a day while in use). */
  lastActiveAt: string;
  current: boolean;
};

/**
 * The user's signed-in devices, newest activity first. Read here instead of
 * Better Auth's /list-sessions, which sends every session token to the
 * browser and only works for a session younger than a day.
 */
export async function listActiveSessions(): Promise<ActiveSession[] | null> {
  const session = await getSession();
  if (!session) return null;

  const rows = await prisma.session.findMany({
    where: { userId: session.user.id, expiresAt: { gt: new Date() } },
    select: { id: true, userAgent: true, createdAt: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  return rows.map((row) => ({
    id: row.id,
    userAgent: row.userAgent,
    createdAt: row.createdAt.toISOString(),
    lastActiveAt: row.updatedAt.toISOString(),
    current: row.id === session.session.id,
  }));
}

/** Signs one of the user's other devices out. */
export async function revokeActiveSession(id: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { response: false, error: "not_signed_in" };
  if (typeof id !== "string" || id === session.session.id) {
    return { response: false, error: "generic" };
  }

  // Only the user's own sessions; the token never leaves the server.
  const target = await prisma.session.findFirst({
    where: { id, userId: session.user.id },
    select: { token: true },
  });
  if (!target) return { response: false, error: "not_found" };

  try {
    await auth.api.revokeSession({ body: { token: target.token }, headers: await headers() });
    return { response: true };
  } catch {
    return { response: false, error: "generic" };
  }
}

/** Signs out everywhere but this device. */
export async function revokeOtherActiveSessions(): Promise<ActionResult> {
  try {
    await auth.api.revokeOtherSessions({ headers: await headers() });
    return { response: true };
  } catch {
    return { response: false, error: "not_signed_in" };
  }
}

/**
 * A password for an account that only signs in with Google, so it can also
 * sign in with email. Better Auth only allows this from the server.
 */
export async function setAccountPassword(newPassword: string): Promise<ActionResult> {
  if (typeof newPassword !== "string" || !new PasswordService(newPassword).validPassword().valid) {
    return { response: false, error: "password_invalid" };
  }

  try {
    await auth.api.setPassword({ body: { newPassword }, headers: await headers() });
    return { response: true };
  } catch {
    return { response: false, error: "password_already_set" };
  }
}

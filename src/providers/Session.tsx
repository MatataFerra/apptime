"use client";

import { createContext, type ReactNode, useContext } from "react";

import type { ClientSession } from "@/utils/auth/session";

const SessionContext = createContext<ClientSession>(null);

/**
 * The session read on the server by the layout, so the client never waits
 * for a session request. Signing in or out reloads the page, which reads
 * it again.
 */
export function SessionProvider({
  session,
  children,
}: {
  session: ClientSession;
  children: ReactNode;
}) {
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export function useAuthSession() {
  const session = useContext(SessionContext);
  return { session, user: session?.user ?? null, isSignedIn: !!session };
}

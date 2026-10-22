import { dehydrate, QueryClient } from "@tanstack/react-query";

import { getSession } from "@/utils/auth/session";
import { USE_QUERY_KEYS } from "@/utils/constants/use-query";

import "server-only";

import prisma from "#/prisma/client";

/** The signed-in user with shifts (and their taxes), profile and config. Never the password. */
async function findUserForClient(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      image: true,
      name: true,
      type_account: true,
      role: true,
      online: true,
      formCompleted: true,
      isActive: true,
      shifts: {
        include: {
          hourly: { include: { taxes: true } },
          production: { include: { taxes: true } },
        },
      },
      profile: true,
      config: true,
    },
  });
}

/**
 * Same JSON the API routes send (dates as ISO strings), so components
 * can't tell a server-prefetched cache entry from a fetched one.
 */
function asJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Seeds React Query on the server so the first render already has the
 * user and their shifts: one database query instead of the session,
 * user, hourly and production requests the client used to make.
 */
export async function prefetchUserData() {
  const queryClient = new QueryClient();
  const session = await getSession();
  const email = session?.user.email;
  const userId = session?.user.id;
  let profile: { name: string; email: string; image: string | null } | null = null;

  if (email && userId) {
    // By id: the email in the session cookie cache can be stale.
    const user = await findUserForClient(userId).catch(() => null);

    if (user) {
      const data = asJson(user);
      profile = { name: data.name, email: data.email, image: data.image };
      const ok = { message: "success", response: true } as const;

      queryClient.setQueryData([USE_QUERY_KEYS.USER, email], { ...ok, user: data });
      queryClient.setQueryData([USE_QUERY_KEYS.HOURLY], {
        ...ok,
        hourly: data.shifts?.hourly ?? [],
      });
      queryClient.setQueryData([USE_QUERY_KEYS.PRODUCTION], {
        ...ok,
        production: data.shifts?.production ?? [],
      });
    }
  }

  return { session, profile, state: dehydrate(queryClient) };
}

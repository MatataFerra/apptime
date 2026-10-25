import { dehydrate, QueryClient } from "@tanstack/react-query";

import { getSession } from "@/utils/auth/session";
import { USE_QUERY_KEYS } from "@/utils/constants/use-query";

import "server-only";

import prisma from "#/prisma/client";

/**
 * The signed-in user (never the password) with only their shift container,
 * plus both shift lists with the same includes as /api/shift/hourly and
 * /api/shift/production. Three queries in parallel; the lists aren't
 * nested in the user, so the page carries each shift once.
 */
async function findUserForClient(id: string) {
  const [user, hourly, production] = await Promise.all([
    prisma.user.findUnique({
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
        shifts: true,
        profile: true,
        config: true,
      },
    }),
    prisma.hourly.findMany({
      where: { shift: { userId: id } },
      include: { taxes: true, contributions: true },
    }),
    prisma.production.findMany({
      where: { shift: { userId: id } },
      include: { taxes: true, contributions: true },
    }),
  ]);

  return user ? { user, hourly, production } : null;
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
 * user and their shifts, instead of the user, hourly and production
 * requests the client used to make.
 */
export async function prefetchUserData() {
  const queryClient = new QueryClient();
  const session = await getSession();
  const email = session?.user.email;
  const userId = session?.user.id;
  let profile: { name: string; email: string; image: string | null } | null = null;

  if (email && userId) {
    // By id: the email in the session cookie cache can be stale.
    const found = await findUserForClient(userId).catch(() => null);

    if (found) {
      const { user, hourly, production } = asJson(found);
      profile = { name: user.name, email: user.email, image: user.image };
      const ok = { message: "success", response: true } as const;

      queryClient.setQueryData([USE_QUERY_KEYS.USER, email], { ...ok, user });
      queryClient.setQueryData([USE_QUERY_KEYS.HOURLY], { ...ok, hourly });
      queryClient.setQueryData([USE_QUERY_KEYS.PRODUCTION], { ...ok, production });
    }
  }

  return { session, profile, state: dehydrate(queryClient) };
}

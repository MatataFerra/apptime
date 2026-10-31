import { defaultShouldDehydrateQuery, dehydrate, QueryClient } from "@tanstack/react-query";

import { getSession } from "@/utils/auth/session";
import { USE_QUERY_KEYS } from "@/utils/constants/use-query";

import "server-only";

import prisma from "#/prisma/client";

/**
 * Same JSON the API routes send (dates as ISO strings), so components
 * can't tell a server-prefetched cache entry from a fetched one.
 */
function asJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

const ok = { message: "success", response: true } as const;

/** The signed-in user (never the password) with only their shift container. */
async function findUser(id: string) {
  const user = await prisma.user.findUnique({
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
  });
  // Rejecting leaves the query to the client, which fetches it as before.
  if (!user) throw new Error("User not found");
  return { ...ok, user: asJson(user) };
}

/**
 * Both shift lists with the same includes as /api/shift/hourly and
 * /api/shift/production. Not nested in the user, so the page carries
 * each shift once.
 */
async function findHourly(userId: string) {
  const hourly = await prisma.hourly.findMany({
    where: { shift: { userId } },
    include: { taxes: true, contributions: true },
  });
  return { ...ok, hourly: asJson(hourly) };
}

async function findProduction(userId: string) {
  const production = await prisma.production.findMany({
    where: { shift: { userId } },
    include: { taxes: true, contributions: true },
  });
  return { ...ok, production: asJson(production) };
}

/**
 * Seeds React Query from the server without holding the page: the three
 * queries start here but aren't awaited. They're dehydrated while still
 * pending, so the layout streams right away and each promise resolves in
 * the client cache when its data reaches the browser (no second request).
 * One that fails rejects there, and useQuery retries it through the API.
 *
 * `profile` (side menu) comes from the session, which needs no database.
 */
export async function prefetchUserData() {
  const queryClient = new QueryClient();
  const session = await getSession();
  const email = session?.user.email;
  const userId = session?.user.id;

  if (email && userId) {
    // By id: the email in the session cookie cache can be stale. The keys
    // are the ones useUser / useHourlyShifts / useProductionShifts use, so
    // userId stays out of them on purpose.
    /* eslint-disable @tanstack/query/exhaustive-deps */
    void queryClient.prefetchQuery({
      queryKey: [USE_QUERY_KEYS.USER, email],
      queryFn: () => findUser(userId),
    });
    void queryClient.prefetchQuery({
      queryKey: [USE_QUERY_KEYS.HOURLY],
      queryFn: () => findHourly(userId),
    });
    void queryClient.prefetchQuery({
      queryKey: [USE_QUERY_KEYS.PRODUCTION],
      queryFn: () => findProduction(userId),
    });
    /* eslint-enable @tanstack/query/exhaustive-deps */
  }

  const profile = session
    ? { name: session.user.name, email: session.user.email, image: session.user.image ?? null }
    : null;

  return {
    session,
    profile,
    state: dehydrate(queryClient, {
      shouldDehydrateQuery: (query) =>
        defaultShouldDehydrateQuery(query) || query.state.status === "pending",
    }),
  };
}

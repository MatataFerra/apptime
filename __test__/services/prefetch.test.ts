import { hydrate, QueryClient } from "@tanstack/react-query";
import { describe, expect, test, vi } from "vitest";

import { prefetchUserData } from "@/services/Prefetch";

vi.mock("server-only", () => ({}));

const { findUnique, findHourly, findProduction, getSession } = vi.hoisted(() => ({
  findUnique: vi.fn(),
  findHourly: vi.fn(),
  findProduction: vi.fn(),
  getSession: vi.fn(),
}));
vi.mock("#/prisma/client", () => ({
  default: {
    user: { findUnique },
    hourly: { findMany: findHourly },
    production: { findMany: findProduction },
  },
}));
vi.mock("@/utils/auth/session", () => ({ getSession }));

const start = new Date("2026-10-18T08:00:00.000Z");
const session = { user: { id: "u1", email: "ana@example.com", name: "Ana", image: null } };
const dbUser = {
  id: "u1",
  email: "ana@example.com",
  name: "Ana",
  image: null,
  role: "USER",
  shifts: { id: 1, userId: "u1" },
  profile: null,
  config: { weekStartsOn: "monday" },
};
const dbHourly = [
  { id: 10, startDate: start, isClosed: true, taxes: [{ id: 1, name: "PAYE", value: 10.5 }] },
];
const dbProduction = [{ id: 20, startDate: start, isClosed: true, taxes: [] }];

function seedDb() {
  findUnique.mockResolvedValueOnce(dbUser);
  findHourly.mockResolvedValueOnce(dbHourly);
  findProduction.mockResolvedValueOnce(dbProduction);
}

type State = Awaited<ReturnType<typeof prefetchUserData>>["state"];

function dehydrated(state: State, key: unknown[]) {
  return state.queries.find((q) => JSON.stringify(q.queryKey) === JSON.stringify(key));
}

/** What the client cache ends up with once the streamed promise lands. */
async function onClient(state: State, key: unknown[]) {
  const client = new QueryClient();
  hydrate(client, state);
  await dehydrated(state, key)?.promise?.catch(() => {});
  await new Promise((resolve) => setTimeout(resolve, 0));
  return client.getQueryState(key);
}

describe("prefetchUserData", () => {
  test("doesn't wait for the database: the queries go out pending", async () => {
    getSession.mockResolvedValueOnce(session);
    // The shift lists never answer, and the page still renders.
    findUnique.mockResolvedValueOnce(dbUser);
    findHourly.mockReturnValueOnce(new Promise(() => {}));
    findProduction.mockReturnValueOnce(new Promise(() => {}));

    const { state, profile } = await prefetchUserData();

    expect(state.queries.map((q) => [q.queryKey, q.state.status])).toEqual([
      [["user", "ana@example.com"], "pending"],
      [["hourly"], "pending"],
      [["production"], "pending"],
    ]);
    expect(state.queries.every((q) => q.promise)).toBe(true);
    // The side menu reads the session, no database needed.
    expect(profile).toEqual({ name: "Ana", email: "ana@example.com", image: null });
  });

  test("each query resolves in the client cache with the API's shape", async () => {
    getSession.mockResolvedValueOnce(session);
    seedDb();

    const { state } = await prefetchUserData();

    // By id: the email in the session cookie cache can be stale.
    expect(findUnique.mock.calls.at(-1)?.[0].where).toEqual({ id: "u1" });
    expect(findHourly.mock.calls.at(-1)?.[0].where).toEqual({ shift: { userId: "u1" } });
    expect(findProduction.mock.calls.at(-1)?.[0].where).toEqual({ shift: { userId: "u1" } });

    const user = await onClient(state, ["user", "ana@example.com"]);
    expect(user?.status).toBe("success");
    expect((user?.data as any).user.name).toBe("Ana");
    // Only the shift container, so each shift is sent once.
    expect((user?.data as any).user.shifts).toEqual({ id: 1, userId: "u1" });

    const hourly = (await onClient(state, ["hourly"]))?.data as any;
    expect(hourly.hourly[0].taxes[0].name).toBe("PAYE");
    // Dates arrive as strings, like the API sends them.
    expect(hourly.hourly[0].startDate).toBe("2026-10-18T08:00:00.000Z");
    expect(((await onClient(state, ["production"]))?.data as any).production).toHaveLength(1);
  });

  test("never selects the password", async () => {
    getSession.mockResolvedValueOnce(session);
    seedDb();

    await prefetchUserData();

    expect(findUnique.mock.calls.at(-1)?.[0].select.password).toBeUndefined();
  });

  test("signed out: nothing is seeded", async () => {
    getSession.mockResolvedValueOnce(null);
    const { state, profile } = await prefetchUserData();
    expect(state.queries).toHaveLength(0);
    expect(profile).toBeNull();
  });

  test("database down: the query fails on the client, which retries it through the API", async () => {
    getSession.mockResolvedValueOnce(session);
    findUnique.mockRejectedValueOnce(new Error("db down"));
    findHourly.mockResolvedValueOnce(dbHourly);
    findProduction.mockResolvedValueOnce(dbProduction);

    const { state } = await prefetchUserData();

    const client = new QueryClient({ defaultOptions: { queries: { retry: 1, retryDelay: 0 } } });
    hydrate(client, state);
    const fromApi = vi.fn().mockResolvedValue({ user: { name: "Ana" } });
    // useQuery's options reach the query once a component observes it.
    client
      .getQueryCache()
      .find({ queryKey: ["user", "ana@example.com"] })
      ?.setOptions({
        queryKey: ["user", "ana@example.com"],
        queryFn: fromApi,
        retry: 1,
        retryDelay: 0,
      });
    await vi.waitFor(() =>
      expect(client.getQueryState(["user", "ana@example.com"])?.status).toBe("success")
    );
    expect(fromApi).toHaveBeenCalledTimes(1);
  });
});

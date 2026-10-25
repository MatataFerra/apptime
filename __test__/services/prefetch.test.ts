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

function query(state: Awaited<ReturnType<typeof prefetchUserData>>["state"], key: unknown[]) {
  return state.queries.find((q) => JSON.stringify(q.queryKey) === JSON.stringify(key))?.state
    .data as any;
}

describe("prefetchUserData", () => {
  test("seeds user, hourly and production", async () => {
    getSession.mockResolvedValueOnce({ user: { id: "u1", email: "ana@example.com" } });
    seedDb();

    const { state, profile } = await prefetchUserData();

    expect(findUnique).toHaveBeenCalledTimes(1);
    // By id: the email in the session cookie cache can be stale.
    expect(findUnique.mock.calls[0][0].where).toEqual({ id: "u1" });
    expect(findHourly.mock.calls[0][0].where).toEqual({ shift: { userId: "u1" } });
    expect(findProduction.mock.calls[0][0].where).toEqual({ shift: { userId: "u1" } });
    expect(query(state, ["user", "ana@example.com"]).user.name).toBe("Ana");
    expect(query(state, ["hourly"]).hourly[0].taxes[0].name).toBe("PAYE");
    expect(query(state, ["production"]).production).toHaveLength(1);
    expect(profile).toEqual({ name: "Ana", email: "ana@example.com", image: null });
  });

  test("the user carries only its shift container, so each shift is sent once", async () => {
    getSession.mockResolvedValueOnce({ user: { id: "u1", email: "ana@example.com" } });
    seedDb();

    const { state } = await prefetchUserData();

    expect(findUnique.mock.calls.at(-1)?.[0].select.shifts).toBe(true);
    expect(query(state, ["user", "ana@example.com"]).user.shifts).toEqual({ id: 1, userId: "u1" });
  });

  test("dates arrive as strings, like the API sends them", async () => {
    getSession.mockResolvedValueOnce({ user: { id: "u1", email: "ana@example.com" } });
    seedDb();

    const { state } = await prefetchUserData();

    expect(query(state, ["hourly"]).hourly[0].startDate).toBe("2026-10-18T08:00:00.000Z");
  });

  test("never selects the password", async () => {
    getSession.mockResolvedValueOnce({ user: { id: "u1", email: "ana@example.com" } });
    seedDb();

    await prefetchUserData();

    expect(findUnique.mock.calls.at(-1)?.[0].select.password).toBeUndefined();
  });

  test("signed out or database down: nothing is seeded and the client fetches as before", async () => {
    getSession.mockResolvedValueOnce(null);
    expect((await prefetchUserData()).state.queries).toHaveLength(0);

    getSession.mockResolvedValueOnce({ user: { id: "u1", email: "ana@example.com" } });
    findUnique.mockRejectedValueOnce(new Error("db down"));
    const down = await prefetchUserData();
    expect(down.state.queries).toHaveLength(0);
    expect(down.profile).toBeNull();
  });
});

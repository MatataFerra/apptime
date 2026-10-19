import { describe, expect, test, vi } from "vitest";

import { prefetchUserData } from "@/services/Prefetch";

vi.mock("server-only", () => ({}));

const { findUnique, getServerSession } = vi.hoisted(() => ({
  findUnique: vi.fn(),
  getServerSession: vi.fn(),
}));
vi.mock("#/prisma/client", () => ({ default: { user: { findUnique } } }));
vi.mock("next-auth", () => ({ getServerSession }));


const start = new Date("2026-10-18T08:00:00.000Z");
const dbUser = {
  id: "u1",
  email: "ana@example.com",
  name: "Ana",
  image: null,
  role: "USER",
  shifts: {
    id: 1,
    hourly: [{ id: 10, startDate: start, isClosed: true, taxes: [{ id: 1, name: "PAYE", value: 10.5 }] }],
    production: [{ id: 20, startDate: start, isClosed: true, taxes: [] }],
  },
  profile: null,
  config: { weekStartsOn: "monday" },
};

function query(state: Awaited<ReturnType<typeof prefetchUserData>>["state"], key: unknown[]) {
  return state.queries.find((q) => JSON.stringify(q.queryKey) === JSON.stringify(key))?.state.data as any;
}

describe("prefetchUserData", () => {
  test("seeds user, hourly and production from one query", async () => {
    getServerSession.mockResolvedValueOnce({ user: { email: "ana@example.com" } });
    findUnique.mockResolvedValueOnce(dbUser);

    const { state, profile } = await prefetchUserData();

    expect(findUnique).toHaveBeenCalledTimes(1);
    expect(query(state, ["user", "ana@example.com"]).user.name).toBe("Ana");
    expect(query(state, ["hourly"]).hourly[0].taxes[0].name).toBe("PAYE");
    expect(query(state, ["production"]).production).toHaveLength(1);
    expect(profile).toEqual({ name: "Ana", email: "ana@example.com", image: null });
  });

  test("dates arrive as strings, like the API sends them", async () => {
    getServerSession.mockResolvedValueOnce({ user: { email: "ana@example.com" } });
    findUnique.mockResolvedValueOnce(dbUser);

    const { state } = await prefetchUserData();

    expect(query(state, ["hourly"]).hourly[0].startDate).toBe("2026-10-18T08:00:00.000Z");
  });

  test("never selects the password", async () => {
    getServerSession.mockResolvedValueOnce({ user: { email: "ana@example.com" } });
    findUnique.mockResolvedValueOnce(dbUser);

    await prefetchUserData();

    expect(findUnique.mock.calls.at(-1)?.[0].select.password).toBeUndefined();
  });

  test("signed out or database down: nothing is seeded and the client fetches as before", async () => {
    getServerSession.mockResolvedValueOnce(null);
    expect((await prefetchUserData()).state.queries).toHaveLength(0);

    getServerSession.mockResolvedValueOnce({ user: { email: "ana@example.com" } });
    findUnique.mockRejectedValueOnce(new Error("db down"));
    const down = await prefetchUserData();
    expect(down.state.queries).toHaveLength(0);
    expect(down.profile).toBeNull();
  });
});

import { beforeEach, describe, expect, test, vi } from "vitest";

const db = vi.hoisted(() => ({
  waitingListDesktop: { upsert: vi.fn(), findMany: vi.fn() },
}));

const limiter = vi.hoisted(() => ({ allowed: true }));

vi.mock("#/prisma/client", () => ({ default: db }));
vi.mock("@/services/RateLimit", async (importOriginal) => ({
  clientIp: (await importOriginal<typeof import("@/services/RateLimit")>()).clientIp,
  consumeRateLimit: vi.fn(async () => limiter.allowed),
}));

import { consumeRateLimit } from "@/services/RateLimit";

import * as route from "@/app/api/waiting-list/route";

function post(body: unknown) {
  return route.POST(
    new Request("http://localhost:3000/api/waiting-list", {
      method: "POST",
      headers: { "x-forwarded-for": "203.0.113.5" },
      body: JSON.stringify(body),
    }) as never
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  limiter.allowed = true;
  db.waitingListDesktop.upsert.mockResolvedValue({ id: 1, email: "a@x.com" });
});

describe("/api/waiting-list", () => {
  test("there's no GET: the list of emails isn't public", () => {
    expect("GET" in route).toBe(false);
  });

  test("adds the email, normalized, and answers without echoing the row", async () => {
    const response = await post({ email: "  A@X.com " });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ message: "success", response: true });
    expect(db.waitingListDesktop.upsert).toHaveBeenCalledWith({
      where: { email: "a@x.com" },
      create: { email: "a@x.com" },
      update: {},
    });
  });

  test("an invalid email is a 400 and nothing is written", async () => {
    expect((await post({ email: "nope" })).status).toBe(400);
    expect(db.waitingListDesktop.upsert).not.toHaveBeenCalled();
  });

  test("over the per-IP limit: 429 and nothing is written", async () => {
    limiter.allowed = false;
    const response = await post({ email: "a@x.com" });
    expect(response.status).toBe(429);
    expect(db.waitingListDesktop.upsert).not.toHaveBeenCalled();
    expect(vi.mocked(consumeRateLimit)).toHaveBeenCalledWith(
      "waiting-list:ip:203.0.113.5",
      expect.anything()
    );
  });
});

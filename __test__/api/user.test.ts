import { beforeEach, describe, expect, test, vi } from "vitest";

const db = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
}));
const session = vi.hoisted(() => ({ getRequestSession: vi.fn() }));

vi.mock("#/prisma/client", () => ({ default: db }));
vi.mock("@/utils/auth/session", () => ({
  getRequestSession: session.getRequestSession,
  getSession: vi.fn(),
}));

import { NextRequest } from "next/server";

import { GET } from "@/app/api/user/route";

// The nested include that used to pull Account (password hash, OAuth tokens)
// and Session (tokens) rows through Profile.user / Config.user.
const NESTED = JSON.stringify({
  include: { user: { include: { accounts: true, sessions: true } } },
});

function get(query: string) {
  return GET(new NextRequest(`http://localhost:3000/api/user?${query}`));
}

function sessionAs(role: "USER" | "ADMIN") {
  session.getRequestSession.mockResolvedValue({
    user: { id: "u1", email: "ana@example.test", role },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  sessionAs("USER");
  db.user.findUnique.mockResolvedValue({ id: "u1", email: "ana@example.test" });
});

describe("GET /api/user include flags", () => {
  test.each(["profile", "config", "shifts"])(
    "a JSON object in %s is a 400 and never reaches Prisma",
    async (param) => {
      const response = await get(`${param}=${encodeURIComponent(NESTED)}`);
      expect(response.status).toBe(400);
      expect(db.user.findUnique).not.toHaveBeenCalled();
    }
  );

  test("an admin can't use the include to read another user's credentials either", async () => {
    sessionAs("ADMIN");
    const response = await get(
      `email=${encodeURIComponent("bob@example.test")}&config=${encodeURIComponent(NESTED)}`
    );
    expect(response.status).toBe(400);
    expect(db.user.findUnique).not.toHaveBeenCalled();
  });

  test("true/false flags become plain booleans in the include", async () => {
    const response = await get("shifts=false&profile=true&config=false");
    expect(response.status).toBe(200);
    expect(db.user.findUnique).toHaveBeenCalledWith({
      where: { id: "u1" },
      include: { shifts: true, profile: true, config: false },
    });
  });

  test("shifts=true includes both shift lists and nothing else", async () => {
    await get("shifts=true&profile=false&config=true");
    expect(db.user.findUnique).toHaveBeenCalledWith({
      where: { id: "u1" },
      include: {
        shifts: { include: { hourly: true, production: true } },
        profile: false,
        config: true,
      },
    });
  });

  test("missing flags default to false", async () => {
    await get("");
    expect(db.user.findUnique).toHaveBeenCalledWith({
      where: { id: "u1" },
      include: { shifts: true, profile: false, config: false },
    });
  });

  test("without a session it's a 401", async () => {
    session.getRequestSession.mockResolvedValue(null);
    expect((await get("profile=true")).status).toBe(401);
    expect(db.user.findUnique).not.toHaveBeenCalled();
  });
});

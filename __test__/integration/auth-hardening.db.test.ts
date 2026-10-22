/**
 * On a real SQLite database (every migration applied to a temp file) with
 * the real Better Auth instance: the password rules on Better Auth's own
 * endpoints, and lookups by user id so a stale email in the session cookie
 * cache doesn't lock the user out.
 */
import { createClient } from "@libsql/client";
import { readdirSync, readFileSync } from "fs";
import { NextRequest } from "next/server";
import { join } from "path";
import { beforeAll, describe, expect, test, vi } from "vitest";

const env = vi.hoisted(() => {
  const { mkdtempSync } = require("fs");
  const { tmpdir } = require("os");
  const { join } = require("path");

  const url = `file:${join(mkdtempSync(join(tmpdir(), "apptime-ah-")), "test.db")}`;
  process.env.TURSO_ON = "true";
  process.env.NEXT_PUBLIC_TURSO_DATABASE_URL = url;
  process.env.TURSO_AUTH_TOKEN = "";
  process.env.BETTER_AUTH_SECRET = "test-secret-that-is-long-enough-1234567890";
  process.env.BETTER_AUTH_URL = "http://localhost:3000";
  return { url, headers: new Headers() };
});

vi.mock("next/headers", () => ({
  headers: async () => env.headers,
  cookies: async () => ({ get: () => undefined, set: () => undefined }),
}));
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { auth } from "@/utils/auth";

import { GET as getHourly } from "@/app/api/shift/hourly/route";
import { GET as getUser } from "@/app/api/user/route";
import onUpdatePreferences from "@/server-actions/update-preferences";
import prisma from "#/prisma/client";

const PASSWORD = "Secreto123!";

async function migrate() {
  const client = createClient({ url: env.url });
  const dir = join(process.cwd(), "prisma/migrations");
  for (const name of readdirSync(dir).sort()) {
    if (!/^\d/.test(name)) continue;
    await client.executeMultiple(readFileSync(join(dir, name, "migration.sql"), "utf8"));
  }
  client.close();
}

function post(path: string, body: unknown) {
  return auth.handler(
    new Request(`http://localhost:3000/api/auth${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost:3000" },
      body: JSON.stringify(body),
    })
  );
}

/** Signs in for real and returns the Cookie header the browser would send. */
async function signIn(email: string) {
  const { headers } = await auth.api.signInEmail({
    body: { email, password: PASSWORD },
    returnHeaders: true,
  });
  const cookie = (headers.get("set-cookie") ?? "")
    .split(/,(?=\s*[\w.-]+=)/)
    .map((c) => c.trim().split(";")[0])
    .join("; ");
  return new Headers({ cookie });
}

describe("auth hardening on a real database", () => {
  beforeAll(migrate);

  describe("password rules on Better Auth's endpoints", () => {
    test.each(["weakweak", "Weakweak1", "weakweak1!", "Sh0rt!"])(
      "sign-up with %j is refused",
      async (password) => {
        const response = await post("/sign-up/email", { email: "weak@x.com", password, name: "W" });
        expect(response.status).toBe(400);
        expect((await response.json()).message).toBe("Password is not valid");
      }
    );

    test("no user was created by those attempts", async () => {
      expect(await prisma.user.findUnique({ where: { email: "weak@x.com" } })).toBeNull();
    });

    test("server-side auth.api calls follow the same rules", async () => {
      await expect(
        auth.api.signUpEmail({ body: { email: "weak@x.com", password: "weakweak", name: "W" } })
      ).rejects.toThrow("Password is not valid");
    });

    test("reset-password with a weak new password is refused before the token is checked", async () => {
      const response = await post("/reset-password", { newPassword: "weakweak", token: "x" });
      expect(response.status).toBe(400);
      expect((await response.json()).message).toBe("Password is not valid");
    });

    test("a password that follows the rules signs up", async () => {
      const response = await post("/sign-up/email", {
        email: "ana@x.com",
        password: PASSWORD,
        name: "Ana",
      });
      expect(response.status).toBe(200);
    });
  });

  describe("a stale email in the session cookie cache", () => {
    let cookies: Headers;
    let userId: string;

    beforeAll(async () => {
      cookies = await signIn("ana@x.com");
      userId = (await prisma.user.findUniqueOrThrow({ where: { email: "ana@x.com" } })).id;
      env.headers = cookies;
      // The email changes after the cookie cache was written (e.g. in Settings).
      await prisma.user.update({ where: { id: userId }, data: { email: "ana.new@x.com" } });
      expect((await auth.api.getSession({ headers: cookies }))?.user.email).toBe("ana@x.com");
    });

    test("server actions still find the user", async () => {
      expect(await onUpdatePreferences({ weekStartsOn: "sunday" })).toMatchObject({ ok: true });
    });

    test("GET /api/user returns the user", async () => {
      const response = await getUser(
        new NextRequest("http://localhost:3000/api/user?config=true", { headers: cookies })
      );
      expect(response.status).toBe(200);
      expect((await response.json()).user.email).toBe("ana.new@x.com");
    });

    test("GET /api/shift/hourly returns the user's shifts", async () => {
      const container = await prisma.shift.findUniqueOrThrow({ where: { userId } });
      await prisma.hourly.create({
        data: { startDate: new Date().toString(), hourValue: 20, shiftId: container.id },
      });
      const response = await getHourly(
        new Request("http://localhost:3000/api", { headers: cookies }) as never
      );
      expect((await response.json()).hourly).toHaveLength(1);
    });
  });
});

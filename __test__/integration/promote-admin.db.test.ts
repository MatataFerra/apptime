/**
 * The admin:promote script on a real SQLite database (every migration
 * applied to a temp file), with the real Better Auth instance: the role
 * changes, the user's sessions are signed out, and nothing in the HTTP API
 * can create an admin anymore.
 */
import { createClient } from "@libsql/client";
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { beforeAll, describe, expect, test, vi } from "vitest";

const env = vi.hoisted(() => {
  const { mkdtempSync } = require("fs");
  const { tmpdir } = require("os");
  const { join } = require("path");

  const url = `file:${join(mkdtempSync(join(tmpdir(), "apptime-admin-")), "test.db")}`;
  process.env.TURSO_ON = "true";
  process.env.TURSO_DATABASE_URL = url;
  process.env.TURSO_AUTH_TOKEN = "";
  process.env.BETTER_AUTH_SECRET = "test-secret-that-is-long-enough-1234567890";
  process.env.BETTER_AUTH_URL = "http://localhost:3000";
  return { url };
});

vi.mock("server-only", () => ({}));

import { auth } from "@/utils/auth";

import prisma from "#/prisma/client";
import { setAdmin } from "#/prisma/promote-admin";

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

describe("admin:promote", () => {
  beforeAll(async () => {
    await migrate();
    await auth.api.signUpEmail({ body: { email: "ana@x.com", password: PASSWORD, name: "Ana" } });
    await auth.api.signInEmail({ body: { email: "ana@x.com", password: PASSWORD } });
  });

  test("makes the user ADMIN and signs out their sessions", async () => {
    const user = await prisma.user.findUniqueOrThrow({ where: { email: "ana@x.com" } });
    expect(await prisma.session.count({ where: { userId: user.id } })).toBeGreaterThan(0);

    expect(await setAdmin(" ANA@x.com ", true)).toEqual({ ok: true, changed: true, role: "ADMIN" });
    expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).role).toBe("ADMIN");
    expect(await prisma.session.count({ where: { userId: user.id } })).toBe(0);
  });

  test("running it again changes nothing", async () => {
    expect(await setAdmin("ana@x.com", true)).toEqual({ ok: true, changed: false, role: "ADMIN" });
  });

  test("--revoke takes the role away", async () => {
    expect(await setAdmin("ana@x.com", false)).toEqual({ ok: true, changed: true, role: "USER" });
  });

  test("an unknown email is an error and nothing changes", async () => {
    expect(await setAdmin("nobody@x.com", true)).toMatchObject({ ok: false });
  });

  test("the HTTP routes that created admins are gone", () => {
    const api = join(process.cwd(), "src/app/api/user/admin");
    expect(existsSync(join(api, "route.ts"))).toBe(false);
    expect(existsSync(join(api, "token/route.ts"))).toBe(false);
  });

  test("sign-up can't choose the role", async () => {
    await auth.api.signUpEmail({
      body: { email: "eve@x.com", password: PASSWORD, name: "Eve", role: "ADMIN" } as never,
    });
    expect((await prisma.user.findUniqueOrThrow({ where: { email: "eve@x.com" } })).role).toBe(
      "USER"
    );
  });
});

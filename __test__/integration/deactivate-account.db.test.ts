// @vitest-environment node
/**
 * Deactivated accounts (User.isActive false, set by an admin) on a real
 * SQLite database with the real Better Auth instance: no new session by any
 * route, and deactivating signs the account out everywhere.
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

  const url = `file:${join(mkdtempSync(join(tmpdir(), "apptime-da-")), "test.db")}`;
  process.env.TURSO_ON = "true";
  process.env.TURSO_DATABASE_URL = url;
  process.env.TURSO_AUTH_TOKEN = "";
  process.env.BETTER_AUTH_SECRET = "test-secret-that-is-long-enough-1234567890";
  process.env.BETTER_AUTH_URL = "http://localhost:3000";
  return { url };
});

vi.mock("server-only", () => ({}));

import { auth } from "@/utils/auth";

import { PUT as putUser } from "@/app/api/user/[id]/route";
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

function signInRequest(email: string) {
  return auth.handler(
    new Request("http://localhost:3000/api/auth/sign-in/email", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost:3000" },
      body: JSON.stringify({ email, password: PASSWORD }),
    })
  );
}

/** Signs in for real and returns the Cookie header the browser would send. */
async function cookiesFor(email: string) {
  const { headers } = await auth.api.signInEmail({
    body: { email, password: PASSWORD },
    returnHeaders: true,
  });
  return (headers.get("set-cookie") ?? "")
    .split(/,(?=\s*[\w.-]+=)/)
    .map((c) => c.trim().split(";")[0])
    .join("; ");
}

function setActive(adminCookies: string, userId: string, isActive: boolean) {
  return putUser(
    new NextRequest(`http://localhost:3000/api/user/${userId}`, {
      method: "PUT",
      headers: { cookie: adminCookies, "content-type": "application/json" },
      body: JSON.stringify({ isActive }),
    }),
    { params: Promise.resolve({ id: userId }) } as never
  );
}

async function userId(email: string) {
  return (await prisma.user.findUniqueOrThrow({ where: { email } })).id;
}

describe("deactivated accounts on a real database", () => {
  let adminCookies = "";

  beforeAll(async () => {
    await migrate();
    for (const email of ["admin@x.com", "ana@x.com", "bob@x.com"]) {
      await auth.api.signUpEmail({ body: { email, password: PASSWORD, name: email } });
    }
    await prisma.user.update({ where: { email: "admin@x.com" }, data: { role: "ADMIN" } });
    adminCookies = await cookiesFor("admin@x.com");
  });

  test("an inactive account can't sign in, and no session is created", async () => {
    await prisma.user.update({ where: { email: "bob@x.com" }, data: { isActive: false } });
    const before = await prisma.session.count({ where: { userId: await userId("bob@x.com") } });

    const response = await signInRequest("bob@x.com");

    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ code: "ACCOUNT_DISABLED" });
    expect(await prisma.session.count({ where: { userId: await userId("bob@x.com") } })).toBe(
      before
    );
  });

  test("an admin deactivating an account removes all its sessions", async () => {
    const ana = await userId("ana@x.com");
    await cookiesFor("ana@x.com");
    await cookiesFor("ana@x.com");
    expect(await prisma.session.count({ where: { userId: ana } })).toBeGreaterThan(0);

    const response = await setActive(adminCookies, ana, false);

    expect(response.status).toBe(200);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: ana } })).isActive).toBe(false);
    expect(await prisma.session.count({ where: { userId: ana } })).toBe(0);
    expect((await signInRequest("ana@x.com")).status).toBe(403);
  });

  test("reactivated, the account signs in again", async () => {
    const ana = await userId("ana@x.com");
    expect((await setActive(adminCookies, ana, true)).status).toBe(200);
    expect((await signInRequest("ana@x.com")).status).toBe(200);
  });

  test("a user can't reactivate their own account (only admins write isActive)", async () => {
    const bob = await userId("bob@x.com");
    await prisma.user.update({ where: { id: bob }, data: { isActive: true } });
    const bobCookies = await cookiesFor("bob@x.com");
    await prisma.user.update({ where: { id: bob }, data: { isActive: false } });

    await setActive(bobCookies, bob, true);

    expect((await prisma.user.findUniqueOrThrow({ where: { id: bob } })).isActive).toBe(false);
  });

  test("the admin's own sessions aren't touched", async () => {
    const admin = await userId("admin@x.com");
    expect(await prisma.session.count({ where: { userId: admin } })).toBeGreaterThan(0);
  });
});

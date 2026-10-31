// @vitest-environment node
/**
 * Email confirmation on a real SQLite database with the real Better Auth
 * instance: the email sent on sign up, the 5-minute grace period, what an
 * account past it can still do, and no temporary inboxes.
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

  const url = `file:${join(mkdtempSync(join(tmpdir(), "apptime-ev-")), "test.db")}`;
  process.env.TURSO_ON = "true";
  process.env.TURSO_DATABASE_URL = url;
  process.env.TURSO_AUTH_TOKEN = "";
  process.env.BETTER_AUTH_SECRET = "test-secret-that-is-long-enough-1234567890";
  process.env.BETTER_AUTH_URL = "http://localhost:3000";
  return {
    url,
    sent: [] as { to: string; subject: string; url: string }[],
  };
});

vi.mock("server-only", () => ({}));
// Captures the email instead of sending it; the link is the button's href.
vi.mock("resend", () => ({
  Resend: class {
    emails = {
      send: async ({ to, subject, html }: Record<string, string>) => {
        const url = /<a href="(http[^"]+)"[^>]*target="_blank"/.exec(html)?.[1] ?? "";
        env.sent.push({ to, subject, url: url.replaceAll("&amp;", "&") });
        return { error: null };
      },
    };
  },
}));

import { auth } from "@/utils/auth";
import { getRequestSession } from "@/utils/auth/session";

import { GET as getHourly } from "@/app/api/shift/hourly/route";
import { GET as getUser } from "@/app/api/user/route";
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

function post(path: string, body: unknown, cookie = "") {
  return auth.handler(
    new Request(`http://localhost:3000/api/auth${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost:3000", cookie },
      body: JSON.stringify(body),
    })
  );
}

/** The Cookie header a browser would send after these Set-Cookie headers. */
function cookieFrom(headers: Headers) {
  return (headers.get("set-cookie") ?? "")
    .split(/,(?=\s*[\w.-]+=)/)
    .map((c) => c.trim().split(";")[0])
    .join("; ");
}

async function signIn(email: string) {
  const { headers } = await auth.api.signInEmail({
    body: { email, password: PASSWORD },
    returnHeaders: true,
  });
  return cookieFrom(headers);
}

async function signUp(email: string) {
  return post("/sign-up/email", { email, password: PASSWORD, name: email.split("@")[0] });
}

/** Moves the account's creation back, as if `minutes` had passed. */
async function ageAccount(email: string, minutes: number) {
  await prisma.user.update({
    where: { email },
    data: { createdAt: new Date(Date.now() - minutes * 60 * 1000) },
  });
}

function hourlyAs(cookie: string) {
  return getHourly(
    new NextRequest("http://localhost:3000/api/shift/hourly", { headers: { cookie } })
  );
}

describe("email confirmation on a real database", () => {
  beforeAll(migrate);

  test("signing up sends the confirmation email to the new address", async () => {
    env.sent.length = 0;
    expect((await signUp("ana@x.com")).status).toBe(200);
    const mail = env.sent.find((m) => m.to === "ana@x.com");
    expect(mail?.subject).toBe("Confirm your CasualApp email");
    expect(mail?.url).toContain("/api/auth/verify-email?token=");
    // The link outlives the 5-minute grace: it works for 24 hours.
    const token = new URL(mail!.url).searchParams.get("token")!;
    const { iat, exp } = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    expect(exp - iat).toBe(24 * 60 * 60);
    expect(
      (await prisma.user.findUniqueOrThrow({ where: { email: "ana@x.com" } })).emailVerified
    ).toBe(false);
  });

  test("within 5 minutes the app works as usual", async () => {
    await signUp("bob@x.com");
    await ageAccount("bob@x.com", 3);
    const cookie = await signIn("bob@x.com");
    expect((await hourlyAs(cookie)).status).toBe(200);
  });

  test("past 5 minutes without confirming: signed in, but the app treats it as signed out", async () => {
    await signUp("cam@x.com");
    await ageAccount("cam@x.com", 10);
    // Signing in still works: the account needs a session to reach the confirm page.
    const cookie = await signIn("cam@x.com");
    expect(cookie).toContain("session_token");

    expect((await hourlyAs(cookie)).status).toBe(401);
    expect(await getRequestSession(new Request("http://x", { headers: { cookie } }))).toBeNull();
    // Better Auth itself still sees the session (resend, sign out).
    expect(await auth.api.getSession({ headers: new Headers({ cookie }) })).not.toBeNull();
  });

  test("opening the link lifts it, with the new cookie and with the old one", async () => {
    env.sent.length = 0;
    await signUp("dan@x.com");
    const link = env.sent.find((m) => m.to === "dan@x.com")!.url;
    await ageAccount("dan@x.com", 10);
    const oldCookie = await signIn("dan@x.com");
    expect((await hourlyAs(oldCookie)).status).toBe(401);

    const verify = await auth.handler(new Request(link, { headers: { cookie: oldCookie } }));
    expect([200, 302]).toContain(verify.status);
    expect(
      (await prisma.user.findUniqueOrThrow({ where: { email: "dan@x.com" } })).emailVerified
    ).toBe(true);

    // The browser that opened it gets a refreshed cookie.
    const newCookie = cookieFrom(verify.headers);
    expect((await hourlyAs(newCookie)).status).toBe(200);
    // A device still holding the old cached cookie isn't locked out either.
    expect((await hourlyAs(oldCookie)).status).toBe(200);
  });

  test("the link from the register form lands on Settings, signed in and confirmed", async () => {
    env.sent.length = 0;
    await post("/sign-up/email", {
      email: "gus@x.com",
      password: PASSWORD,
      name: "gus",
      callbackURL: "/es/settings?email=verified",
    });
    const mail = env.sent.find((m) => m.to === "gus@x.com")!;
    // Built from the callback: in Spanish.
    expect(mail.subject).toBe("Confirma tu email de CasualApp");

    // Opened on another device, with no session there.
    const verify = await auth.handler(new Request(mail.url));
    expect(verify.status).toBe(302);
    expect(verify.headers.get("location")).toBe("/es/settings?email=verified");

    // That device is signed in, and Settings reads the email as confirmed.
    const cookie = cookieFrom(verify.headers);
    const response = await getUser(
      new NextRequest("http://localhost:3000/api/user", { headers: { cookie } })
    );
    expect(response.status).toBe(200);
    expect((await response.json()).user).toMatchObject({
      email: "gus@x.com",
      emailVerified: true,
    });
  });

  test("the confirmation link can be sent again", async () => {
    await signUp("eve@x.com");
    env.sent.length = 0;
    const response = await post("/send-verification-email", { email: "eve@x.com" });
    expect(response.status).toBe(200);
    expect(env.sent.map((m) => m.to)).toEqual(["eve@x.com"]);
  });

  describe("temporary inboxes", () => {
    test.each(["temp@10minutemail.com", "temp@mailinator.com", "Temp@YOPMAIL.com"])(
      "signing up with %s is refused and nothing is created",
      async (email) => {
        const response = await signUp(email);
        expect(response.status).toBe(400);
        expect(await response.json()).toMatchObject({ code: "DISPOSABLE_EMAIL" });
        expect(await prisma.user.findFirst({ where: { email: email.toLowerCase() } })).toBeNull();
      }
    );

    test("changing the email to one is refused too", async () => {
      await signUp("fay@x.com");
      const cookie = await signIn("fay@x.com");
      env.sent.length = 0;
      const response = await post("/change-email", { newEmail: "fay@guerrillamail.com" }, cookie);
      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({ code: "DISPOSABLE_EMAIL" });
      expect(env.sent).toHaveLength(0);
    });
  });
});

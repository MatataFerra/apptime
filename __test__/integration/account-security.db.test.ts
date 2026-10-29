// @vitest-environment node
/**
 * Settings → Account and security on a real SQLite database with the real
 * Better Auth instance: sessions are listed and revoked only for their
 * owner (tokens never leave the server), and a new email only replaces the
 * old one once the link sent to it is opened.
 */
import { createClient } from "@libsql/client";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { beforeAll, describe, expect, test, vi } from "vitest";

const env = vi.hoisted(() => {
  const { mkdtempSync } = require("fs");
  const { tmpdir } = require("os");
  const { join } = require("path");

  const url = `file:${join(mkdtempSync(join(tmpdir(), "apptime-sec-")), "test.db")}`;
  process.env.TURSO_ON = "true";
  process.env.TURSO_DATABASE_URL = url;
  process.env.TURSO_AUTH_TOKEN = "";
  process.env.BETTER_AUTH_SECRET = "test-secret-that-is-long-enough-1234567890";
  process.env.BETTER_AUTH_URL = "http://localhost:3000";
  return {
    url,
    headers: new Headers(),
    sent: [] as { to: string; subject: string; url: string; text: string }[],
  };
});

vi.mock("next/headers", () => ({
  headers: async () => env.headers,
  cookies: async () => ({ get: () => undefined, set: () => undefined }),
}));
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
// Captures the email instead of sending it; the link is the button's href.
vi.mock("resend", () => ({
  Resend: class {
    emails = {
      send: async ({ to, subject, html, text }: Record<string, string>) => {
        const url = /<a href="(http[^"]+)"[^>]*target="_blank"/.exec(html)?.[1] ?? "";
        env.sent.push({ to, subject, url: url.replaceAll("&amp;", "&"), text });
        return { error: null };
      },
    };
  },
}));

import { auth } from "@/utils/auth";

import {
  listActiveSessions,
  revokeActiveSession,
  revokeOtherActiveSessions,
  setAccountPassword,
} from "@/server-actions/account-security";
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

/** Signs in for real and returns the Cookie header that device would send. */
async function signIn(email: string, userAgent = "test") {
  const { headers } = await auth.api.signInEmail({
    body: { email, password: PASSWORD },
    headers: new Headers({ "user-agent": userAgent }),
    returnHeaders: true,
  });
  const cookie = (headers.get("set-cookie") ?? "")
    .split(/,(?=\s*[\w.-]+=)/)
    .map((c) => c.trim().split(";")[0])
    .join("; ");
  return new Headers({ cookie });
}

function as(headers: Headers) {
  env.headers = headers;
}

describe("account and security on a real database", () => {
  beforeAll(async () => {
    await migrate();
    for (const email of ["ana@x.com", "bob@x.com", "eve@x.com"]) {
      await auth.api.signUpEmail({ body: { email, password: PASSWORD, name: email[0] } });
    }
  });

  test("lists only the user's devices, marks this one, and never sends tokens", async () => {
    const phone = await signIn("ana@x.com", "phone");
    await signIn("ana@x.com", "laptop");
    await signIn("bob@x.com", "bob");

    as(phone);
    const sessions = (await listActiveSessions()) ?? [];
    const ana = await prisma.user.findUniqueOrThrow({ where: { email: "ana@x.com" } });
    const own = await prisma.session.count({ where: { userId: ana.id } });

    expect(sessions).toHaveLength(own);
    expect(sessions.filter((s) => s.current)).toHaveLength(1);
    expect(sessions.find((s) => s.current)?.userAgent).toBe("phone");
    expect(JSON.stringify(sessions)).not.toMatch(/token/i);
  });

  test("can't revoke someone else's session or the current one", async () => {
    const phone = await signIn("ana@x.com", "phone");
    as(phone);
    const bob = await prisma.user.findUniqueOrThrow({ where: { email: "bob@x.com" } });
    const bobSession = await prisma.session.findFirstOrThrow({ where: { userId: bob.id } });

    expect(await revokeActiveSession(bobSession.id)).toEqual({
      response: false,
      error: "not_found",
    });
    expect(await prisma.session.findUnique({ where: { id: bobSession.id } })).not.toBeNull();

    const current = (await listActiveSessions())?.find((s) => s.current);
    expect(await revokeActiveSession(current!.id)).toEqual({ response: false, error: "generic" });
  });

  test("revokes another device, then all the others", async () => {
    const phone = await signIn("ana@x.com", "phone");
    as(phone);
    const other = (await listActiveSessions())?.find((s) => !s.current);

    expect(await revokeActiveSession(other!.id)).toEqual({ response: true });
    expect(await prisma.session.findUnique({ where: { id: other!.id } })).toBeNull();

    expect(await revokeOtherActiveSessions()).toEqual({ response: true });
    const left = (await listActiveSessions()) ?? [];
    expect(left).toHaveLength(1);
    expect(left[0].current).toBe(true);

    // Bob is untouched.
    const bob = await prisma.user.findUniqueOrThrow({ where: { email: "bob@x.com" } });
    expect(await prisma.session.count({ where: { userId: bob.id } })).toBeGreaterThan(0);
  });

  test("a password can't be set twice, nor be weak", async () => {
    as(await signIn("ana@x.com"));
    expect(await setAccountPassword("weakweak")).toEqual({
      response: false,
      error: "password_invalid",
    });
    expect(await setAccountPassword("Otro-pass1!")).toEqual({
      response: false,
      error: "password_already_set",
    });
  });

  test("a new email applies only after its link is opened", async () => {
    const cookie = await signIn("eve@x.com");
    const response = await auth.handler(
      new Request("http://localhost:3000/api/auth/change-email", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "http://localhost:3000",
          cookie: cookie.get("cookie") ?? "",
        },
        body: JSON.stringify({
          newEmail: "eve.new@x.com",
          callbackURL: "/es/settings?email=updated",
        }),
      })
    );
    expect(response.status).toBe(200);

    // Still the old one until the link is used; the email went to the new address, in Spanish.
    expect(await prisma.user.findUnique({ where: { email: "eve@x.com" } })).not.toBeNull();
    const mail = env.sent.at(-1)!;
    expect(mail.to).toBe("eve.new@x.com");
    expect(mail.subject).toBe("Confirma tu nuevo email de NomadShift");
    // Sent with a plain-text part too, which carries the same link.
    expect(mail.text).toContain(mail.url.split("?")[0]);

    const verify = await auth.handler(
      new Request(mail.url, { headers: { cookie: cookie.get("cookie") ?? "" } })
    );
    expect(verify.status).toBe(302);
    expect(verify.headers.get("location")).toBe("/es/settings?email=updated");
    expect(await prisma.user.findUnique({ where: { email: "eve.new@x.com" } })).not.toBeNull();
    expect(await prisma.user.findUnique({ where: { email: "eve@x.com" } })).toBeNull();
  });
});

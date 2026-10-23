/**
 * Rate limiting on a real SQLite database (every migration applied to a
 * temp file): Better Auth's limiter with storage "database", and our own
 * limit on the reset password email. NODE_ENV is "production" here because
 * Better Auth only turns its limiter on in production.
 */
import { createClient } from "@libsql/client";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

const env = vi.hoisted(() => {
  const { mkdtempSync } = require("fs");
  const { tmpdir } = require("os");
  const { join } = require("path");

  const url = `file:${join(mkdtempSync(join(tmpdir(), "apptime-rl-")), "test.db")}`;
  process.env.TURSO_ON = "true";
  process.env.TURSO_DATABASE_URL = url;
  process.env.TURSO_AUTH_TOKEN = "";
  process.env.BETTER_AUTH_SECRET = "test-secret-that-is-long-enough-1234567890";
  process.env.BETTER_AUTH_URL = "http://localhost:3000";
  (process.env as Record<string, string>).NODE_ENV = "production";
  return {
    url,
    headers: new Headers(),
    emails: [] as string[],
  };
});

vi.mock("next/headers", () => ({
  headers: async () => env.headers,
  cookies: async () => ({ get: () => undefined, set: () => undefined }),
}));
vi.mock("server-only", () => ({}));
// The email's React template needs the dev JSX runtime, which NODE_ENV=production swaps out.
vi.mock("@/components/ui/EmailTemplate", () => ({ EmailTemplate: () => null }));
vi.mock("resend", () => ({
  Resend: class {
    emails = {
      send: async ({ to }: { to: string }) => {
        env.emails.push(to);
        return { data: { id: "email-1" }, error: null };
      },
    };
  },
}));

import { consumeRateLimit } from "@/services/RateLimit";

import { auth } from "@/utils/auth";

import onSendEmailToResetPassword from "@/server-actions/send-email-reset-password";
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

function signInRequest(ip: string, password: string) {
  return new Request("http://localhost:3000/api/auth/sign-in/email", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://localhost:3000",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify({ email: "ana@x.com", password }),
  });
}

describe("rate limiting on a real database", () => {
  beforeAll(async () => {
    await migrate();
    await auth.api.signUpEmail({ body: { email: "ana@x.com", password: PASSWORD, name: "Ana" } });
  });

  beforeEach(async () => {
    await prisma.actionRateLimit.deleteMany();
    env.emails.length = 0;
    env.headers = new Headers({ "x-forwarded-for": "203.0.113.1" });
  });

  describe("Better Auth (storage: database)", () => {
    test("sign-in: the 4th try in 10 s from one IP is a 429, counted in the RateLimit table", async () => {
      const statuses = [];
      for (let i = 0; i < 4; i++) {
        statuses.push((await auth.handler(signInRequest("198.51.100.7", "wrong-pass"))).status);
      }
      expect(statuses.slice(0, 3)).not.toContain(429);
      expect(statuses[3]).toBe(429);

      const rows = await prisma.rateLimit.findMany();
      expect(rows.some((row) => row.key.includes("198.51.100.7"))).toBe(true);
    });

    test("another IP still gets through", async () => {
      const response = await auth.handler(signInRequest("198.51.100.8", PASSWORD));
      expect(response.status).toBe(200);
    });
  });

  describe("consumeRateLimit", () => {
    test("allows max per window, then refuses, then a new window starts", async () => {
      const rule = { window: 60, max: 2 };
      expect(await consumeRateLimit("k", rule)).toBe(true);
      expect(await consumeRateLimit("k", rule)).toBe(true);
      expect(await consumeRateLimit("k", rule)).toBe(false);
      expect(await consumeRateLimit("other", rule)).toBe(true);

      // Move the window into the past: the next request opens a new one.
      await prisma.actionRateLimit.update({
        where: { key: "k" },
        data: { windowStart: new Date(Date.now() - 61_000) },
      });
      expect(await consumeRateLimit("k", rule)).toBe(true);
      expect((await prisma.actionRateLimit.findUniqueOrThrow({ where: { key: "k" } })).count).toBe(
        1
      );
    });
  });

  describe("reset password email", () => {
    test("3 per address per hour, whatever the casing", async () => {
      const results = [];
      for (const email of ["ana@x.com", "ANA@x.com", " ana@x.com", "ana@x.com"]) {
        // A different IP each time, so only the per-address limit applies.
        env.headers = new Headers({ "x-forwarded-for": `203.0.113.${results.length + 10}` });
        results.push((await onSendEmailToResetPassword(email, "en")).response);
      }
      expect(results).toEqual([true, true, true, false]);
      expect(env.emails).toHaveLength(3);
    });

    test("10 per IP per hour, across addresses", async () => {
      const results = [];
      for (let i = 0; i < 11; i++) {
        results.push((await onSendEmailToResetPassword(`nobody${i}@x.com`, "en")).response);
      }
      expect(results.slice(0, 10).every(Boolean)).toBe(true);
      expect(results[10]).toBe(false);
    });

    test("when limited, it says so and sends nothing", async () => {
      for (let i = 0; i < 3; i++) await onSendEmailToResetPassword("ana@x.com", "en");
      env.emails.length = 0;
      expect(await onSendEmailToResetPassword("ana@x.com", "en")).toEqual({
        response: false,
        error: "too_many_attempts",
      });
      expect(env.emails).toHaveLength(0);
    });
  });
});

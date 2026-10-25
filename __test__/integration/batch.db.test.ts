/**
 * Batch saves on a real SQLite database (every migration in
 * prisma/migrations applied to a temp file), through the app's Prisma
 * client, a real Better Auth session and the batch server actions. Only
 * Next's request headers and cache are stubbed. Every
 * statement is counted: on Turso each one is a network round trip.
 */
import { createClient as libsql } from "@libsql/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { beforeAll, describe, expect, test, vi } from "vitest";

const env = vi.hoisted(() => {
  const { mkdtempSync } = require("fs");
  const { tmpdir } = require("os");
  const { join } = require("path");

  const url = `file:${join(mkdtempSync(join(tmpdir(), "apptime-")), "test.db")}`;
  // Read by prisma/client.ts and the auth config when first imported.
  process.env.TURSO_ON = "true";
  process.env.TURSO_DATABASE_URL = url;
  process.env.TURSO_AUTH_TOKEN = "";
  process.env.BETTER_AUTH_SECRET = "test-secret-that-is-long-enough-1234567890";
  process.env.BETTER_AUTH_URL = "http://localhost:3000";
  return {
    url,
    /** The "current request": server code reads the session cookie from here. */
    headers: new Headers(),
  };
});

vi.mock("next/headers", () => ({
  headers: async () => env.headers,
  cookies: async () => ({ get: () => undefined, set: () => undefined }),
}));
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { auth } from "@/utils/auth";

import onCreateHourlyBatch from "@/server-actions/hourly-batch";
import onCreateHourlyShift from "@/server-actions/hourly-job";
import onCreateProductionBatch from "@/server-actions/production-batch";
import prisma from "#/prisma/client";

/**
 * Counts what goes to libSQL (each one is a round trip on Turso): the
 * adapter's client, wrapped so every execute, batch and transaction step
 * adds one while `net.on`.
 */
const COUNTED = new Set(["execute", "batch", "executeMultiple", "commit", "rollback"]);
function counted<T extends object>(client: T): T {
  return new Proxy(client, {
    get(target, key) {
      const value = Reflect.get(target, key) as unknown;
      if (typeof value !== "function") return value;
      if (key === "transaction") {
        return async (...args: unknown[]) => {
          if (net.on) net.count++;
          return counted(await value.apply(target, args));
        };
      }
      if (COUNTED.has(String(key))) {
        return (...args: unknown[]) => {
          if (net.on) net.count++;
          return value.apply(target, args);
        };
      }
      return value.bind(target);
    },
  });
}
const factory = PrismaLibSql.prototype as unknown as { createClient: (c: unknown) => object };
const createClient = factory.createClient;
factory.createClient = function (this: unknown, config: unknown) {
  return counted(createClient.call(this, config));
};

const PASSWORD = "Secreto123!";
const net = { on: false, count: 0 };

async function migrate() {
  const client = libsql({ url: env.url });
  const dir = join(process.cwd(), "prisma/migrations");
  for (const name of readdirSync(dir).sort()) {
    if (!/^\d/.test(name)) continue;
    await client.executeMultiple(readFileSync(join(dir, name, "migration.sql"), "utf8"));
  }
  client.close();
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

/** Statements sent to the database while `run` goes. */
async function statements<T>(run: () => Promise<T>) {
  net.count = 0;
  net.on = true;
  try {
    return { result: await run(), count: net.count };
  } finally {
    net.on = false;
  }
}

function nights(from: number, days: number, month = 8) {
  return Array.from({ length: days }, (_, i) => ({
    startDate: new Date(2026, month, from + i, 18).toString(),
    endDate: new Date(2026, month, from + i + 1, 6).toString(),
  }));
}

describe("batch saves on a real database", () => {
  beforeAll(async () => {
    await migrate();
    await auth.api.signUpEmail({ body: { email: "a@x.com", password: PASSWORD, name: "a" } });
    env.headers = await signIn("a@x.com");
  });

  test("production: every shift, its quantity, taxes and contributions", async () => {
    const quantities = [8700, 6930, 8700, 5963, 8700, 8700, 8700, 7758, 8700];
    const { result } = await statements(() =>
      onCreateProductionBatch({
        name: "Box Maker",
        itemValue: 0.023,
        currency: "NZD",
        employerId: null,
        taxes: [{ name: "s.security", value: 11, description: null }],
        contributions: [{ name: "Holiday pay (NZ)", value: 8, description: "hint" }],
        shifts: nights(1, 9).map((dates, i) => ({ ...dates, itemQuantity: quantities[i] })),
      })
    );

    expect(result).toEqual({ created: 9, skipped: [] });
    const rows = await prisma.production.findMany({
      include: { taxes: true, contributions: true },
      orderBy: { id: "asc" },
    });
    expect(rows.map((r) => r.itemQuantity)).toEqual(quantities);
    for (const row of rows) {
      expect(row).toMatchObject({
        name: "Box Maker",
        currency: "NZD",
        amount: 720,
        isClosed: true,
      });
      expect(row.taxes.map((t) => t.name)).toEqual(["s.security"]);
      expect(row.contributions.map((c) => c.name)).toEqual(["Holiday pay (NZ)"]);
    }
  });

  test("the number of statements doesn't grow with the number of days", async () => {
    function batch(from: number, days: number) {
      return statements(() =>
        onCreateHourlyBatch({
          name: "Packhouse",
          hourValue: 26.5,
          unpaidBreaks: 30,
          currency: null,
          employerId: null,
          taxes: [{ name: "PAYE", value: 17.5, description: null }],
          contributions: [{ name: "KiwiSaver", value: 3, description: null }],
          shifts: nights(from, days, 10),
        })
      );
    }

    // The first one also creates the tax and the contribution.
    await batch(1, 1);
    const two = await batch(3, 2);
    const twenty = await batch(6, 20);

    expect(two.result?.created).toBe(2);
    expect(twenty.result?.created).toBe(20);
    expect(twenty.count).toBe(two.count);
    expect(await prisma.hourly.count()).toBe(23);
    const linked = await prisma.tax.findFirst({
      where: { name: "PAYE" },
      include: { hourly: true },
    });
    expect(linked?.hourly).toHaveLength(23);
  });

  test("two jobs the same day, as long as the hours don't overlap", async () => {
    // December, clear of the other tests' shifts.
    function at(h: number, m = 0) {
      return new Date(2026, 11, 3, h, m).toString();
    }
    function job(name: string, start: string, end: string) {
      return {
        startDate: start,
        endDate: end,
        hourValue: 25,
        name,
        isPublicHoliday: false,
        isWorked: false,
        unpaidBreaks: 0,
        taxes: [],
        contributions: [],
        currency: null,
        employerId: null,
      };
    }

    // Box Maker in the morning, Web Developer at night: both saved.
    expect(await onCreateHourlyShift(job("Box Maker", at(7), at(12)))).toBeTruthy();
    expect(await onCreateHourlyShift(job("Web Developer", at(18), at(23)))).toBeTruthy();

    // The same hours twice are refused, even from the one-shift form.
    expect(await onCreateHourlyShift(job("Box Maker", at(9), at(11)))).toEqual({
      response: false,
      overlap: true,
    });

    // Batch days: one that fits between them is saved, one that runs into the morning is skipped.
    const between = { startDate: at(13), endDate: at(17) };
    const clash = { startDate: at(11), endDate: at(13) };
    async function batch(shifts: { startDate: string; endDate: string }[]) {
      return onCreateHourlyBatch({
        name: "Picking",
        hourValue: 25,
        unpaidBreaks: 0,
        currency: null,
        employerId: null,
        taxes: [],
        contributions: [],
        shifts,
      });
    }
    expect(await batch([between])).toEqual({ created: 1, skipped: [] });
    expect(await batch([clash])).toEqual({ created: 0, skipped: [clash] });

    const day = await prisma.hourly.findMany({
      where: { name: { in: ["Box Maker", "Web Developer", "Picking"] } },
      orderBy: { id: "asc" },
    });
    expect(day.map((s) => s.name)).toEqual(["Box Maker", "Web Developer", "Picking"]);
  });
});

// @vitest-environment node
/**
 * Settings → Work and calculations on a real SQLite database: the holiday
 * multiplier is stored on each new shift (so changing Settings doesn't
 * rewrite past pay), Live shift rounding on finish, and a default employer
 * that must be the user's own.
 */
import { createClient } from "@libsql/client";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { beforeAll, describe, expect, test, vi } from "vitest";

const env = vi.hoisted(() => {
  const { mkdtempSync } = require("fs");
  const { tmpdir } = require("os");
  const { join } = require("path");

  const url = `file:${join(mkdtempSync(join(tmpdir(), "apptime-work-")), "test.db")}`;
  process.env.TURSO_ON = "true";
  process.env.TURSO_DATABASE_URL = url;
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

import ShiftService from "@/services/Shift";

import { auth } from "@/utils/auth";

import onCreateHourlyBatch from "@/server-actions/hourly-batch";
import onCreateHourlyShift from "@/server-actions/hourly-job";
import onUpdatePreferences from "@/server-actions/update-preferences";
import onUpdateTrackJob from "@/server-actions/update-track";
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

const holiday = {
  name: "Picking",
  hourValue: 20,
  unpaidBreaks: 0,
  isPublicHoliday: true,
  isWorked: true,
  taxes: [],
  contributions: [],
  currency: null,
  employerId: null,
};

describe("work settings on a real database", () => {
  beforeAll(async () => {
    await migrate();
    for (const email of ["a@x.com", "b@x.com"]) {
      await auth.api.signUpEmail({ body: { email, password: PASSWORD, name: email[0] } });
    }
    env.headers = await signIn("a@x.com");
  });

  test("a new shift keeps the holiday rate it was saved with", async () => {
    expect(await onUpdatePreferences({ holidayRate: 2 })).toMatchObject({ ok: true });
    // 25 Dec 2026 is a public holiday; 4 hours worked.
    await onCreateHourlyShift({
      ...holiday,
      startDate: new Date(2026, 11, 25, 8).toString(),
      endDate: new Date(2026, 11, 25, 12).toString(),
    });

    expect(await onUpdatePreferences({ holidayRate: 1.25 })).toMatchObject({ ok: true });
    await onCreateHourlyShift({
      ...holiday,
      startDate: new Date(2026, 11, 26, 8).toString(),
      endDate: new Date(2026, 11, 26, 12).toString(),
    });

    const [first, second] = await prisma.hourly.findMany({ orderBy: { id: "asc" } });
    expect(first.holidayRate).toBe(2);
    expect(second.holidayRate).toBe(1.25);
    // Changing Settings didn't touch what the first one earned.
    expect(new ShiftService({ ...first, publicHolidayWorked: true }).calculateEarnings()).toBe(160);
  });

  test("batch shifts get the rate from Settings too", async () => {
    await onCreateHourlyBatch({
      name: "Packhouse",
      hourValue: 25,
      unpaidBreaks: 0,
      currency: null,
      employerId: null,
      taxes: [],
      contributions: [],
      shifts: [
        {
          startDate: new Date(2026, 10, 2, 8).toString(),
          endDate: new Date(2026, 10, 2, 16).toString(),
        },
      ],
    });
    const row = await prisma.hourly.findFirstOrThrow({ where: { name: "Packhouse" } });
    expect(row.holidayRate).toBe(1.25);
  });

  test("the holiday rate is kept between 1 and 5", async () => {
    expect(await onUpdatePreferences({ holidayRate: 0.5 })).toMatchObject({ ok: false });
    expect(await onUpdatePreferences({ holidayRate: 9 })).toMatchObject({ ok: false });
    expect(await onUpdatePreferences({ roundMinutes: 7 })).toMatchObject({ ok: false });
  });

  test("finishing a live shift rounds it to the step in Settings", async () => {
    expect(await onUpdatePreferences({ roundMinutes: 15 })).toMatchObject({ ok: true });
    const a = await prisma.user.findUniqueOrThrow({
      where: { email: "a@x.com" },
      include: { shifts: true },
    });
    const live = await prisma.hourly.create({
      data: {
        name: "Live",
        startDate: new Date(2026, 10, 3, 7, 58).toString(),
        endDate: null,
        hourValue: 20,
        unpaidBreaks: 0,
        isClosed: false,
        shiftId: a.shifts!.id,
        source: "track",
      },
    });

    await onUpdateTrackJob(
      {
        startDate: live.startDate,
        endDate: new Date(2026, 10, 3, 16, 6).toString(),
        hourValue: 20,
        unpaidBreaks: 0,
        taxes: [],
        contributions: [],
      },
      live.id
    );

    const closed = await prisma.hourly.findUniqueOrThrow({ where: { id: live.id } });
    expect(new Date(closed.startDate)).toEqual(new Date(2026, 10, 3, 8, 0));
    expect(new Date(closed.endDate!)).toEqual(new Date(2026, 10, 3, 16, 0));
    expect(closed.isClosed).toBe(true);
  });

  test("the default employer must be one of the user's own", async () => {
    const b = await prisma.user.findUniqueOrThrow({ where: { email: "b@x.com" } });
    const a = await prisma.user.findUniqueOrThrow({ where: { email: "a@x.com" } });
    const theirs = await prisma.employer.create({ data: { name: "Not yours", userId: b.id } });
    const mine = await prisma.employer.create({ data: { name: "Orchard", userId: a.id } });

    expect(await onUpdatePreferences({ defaultEmployerId: theirs.id })).toMatchObject({
      ok: false,
    });
    expect(await onUpdatePreferences({ defaultEmployerId: mine.id })).toMatchObject({
      ok: true,
      config: { defaultEmployerId: mine.id },
    });
    expect(await onUpdatePreferences({ defaultEmployerId: null })).toMatchObject({ ok: true });
  });

  test("goal and value per item", async () => {
    expect(
      await onUpdatePreferences({ earningsGoal: 800, goalPeriod: "month", itemValue: 0.65 })
    ).toMatchObject({
      ok: true,
      config: { earningsGoal: 800, goalPeriod: "month", itemValue: 0.65 },
    });
    expect(await onUpdatePreferences({ goalPeriod: "year" as "week" })).toMatchObject({
      ok: false,
    });
  });
});

/**
 * Runs the tax flows against a real SQLite database (every migration in
 * prisma/migrations applied to a temp file) through the same Prisma client
 * the app uses. Only the session is mocked.
 */
import { createClient } from "@libsql/client";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { beforeAll, describe, expect, test, vi } from "vitest";

const db = vi.hoisted(() => {
   
  const { mkdtempSync } = require("fs");
   
  const { tmpdir } = require("os");
   
  const { join } = require("path");
  const url = `file:${join(mkdtempSync(join(tmpdir(), "apptime-")), "test.db")}`;
  // prisma/client.ts reads these when it's first imported.
  process.env.TURSO_ON = "true";
  process.env.NEXT_PUBLIC_TURSO_DATABASE_URL = url;
  process.env.TURSO_AUTH_TOKEN = "";
  return { url };
});

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(async () => ({ user: { email: "a@x.com" } })),
}));
vi.mock("next-auth/jwt", () => ({ getToken: vi.fn(async () => ({ email: "a@x.com" })) }));
vi.mock("@/services/User", () => ({
  default: { getSessionUser: vi.fn(async () => ({ id: "u1", shifts: { id: 1 } })) },
}));

import HourlyService from "@/services/Shift/Hourly";

import { GET } from "@/app/api/salary-items/route";
import onEditShift from "@/server-actions/edit-shift";
import { onRemoveSalaryItem, onUpdateSalaryItem } from "@/server-actions/salary-items";
import prisma from "#/prisma/client";

async function migrate() {
  const client = createClient({ url: db.url });
  const dir = join(process.cwd(), "prisma/migrations");
  for (const name of readdirSync(dir).sort()) {
    if (!/^\d/.test(name)) continue;
    await client.executeMultiple(readFileSync(join(dir, name, "migration.sql"), "utf8"));
  }
  client.close();
}

async function addShift(shiftId: number, day: string, userId: string) {
  const shift = await prisma.hourly.create({
    data: {
      name: "Packhouse",
      startDate: new Date(day).toString(),
      endDate: new Date(day).toString(),
      hourValue: 20,
      shiftId,
      isClosed: true,
    },
  });
  const service = new HourlyService(shift as never);
  await service.addtaxes([{ name: "Income tax", value: 10.5, description: null }], userId);
  await service.update(shift.id);
  return shift.id;
}

async function ratesOf(id: number) {
  const shift = await prisma.hourly.findUnique({ where: { id }, include: { taxes: true } });
  return shift?.taxes.map((t) => `${t.name} ${t.value}`);
}

describe("taxes on a real database", () => {
  let september: number;
  let october: number;
  let someoneElses: number;

  beforeAll(async () => {
    await migrate();
    await prisma.user.create({
      data: { id: "u1", email: "a@x.com", name: "A", shifts: { create: { id: 1 } } },
    });
    await prisma.user.create({
      data: { id: "u2", email: "b@x.com", name: "B", shifts: { create: { id: 2 } } },
    });
    september = await addShift(1, "2026-09-01T10:00:00", "u1");
    october = await addShift(1, "2026-10-15T10:00:00", "u1");
    someoneElses = await addShift(2, "2026-10-15T10:00:00", "u2");
  });

  test("each user gets one row per tax, reused across their shifts", async () => {
    const rows = await prisma.tax.findMany({ orderBy: { userId: "asc" } });
    expect(rows.map((r) => r.userId)).toEqual(["u1", "u2"]);
  });

  test("dates stored as ISO text or unix ms both read", async () => {
    const raw = createClient({ url: db.url });
    await raw.execute(
      "UPDATE User SET emailVerified = '2024-05-01T10:00:00.000+00:00' WHERE id = 'u1'"
    );
    await raw.execute("UPDATE User SET emailVerified = 1714557600000 WHERE id = 'u2'");
    raw.close();
    const users = await prisma.user.findMany({
      orderBy: { id: "asc" },
      select: { emailVerified: true },
    });
    expect(users.map((u) => u.emailVerified?.toISOString())).toEqual([
      "2024-05-01T10:00:00.000Z",
      "2024-05-01T10:00:00.000Z",
    ]);
  });

  test("GET /api/salary-items returns the user's taxes with uses", async () => {
    const response = await GET({} as never);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.salaryItems.taxes).toMatchObject([{ name: "Income tax", uses: 2, userId: "u1" }]);
  });

  test("from a date: only later shifts get the new rate", async () => {
    const tax = await prisma.tax.findFirstOrThrow({ where: { userId: "u1" } });
    const result = await onUpdateSalaryItem({
      kind: "tax",
      id: tax.id,
      name: "Income tax",
      value: 17.5,
      description: null,
      from: "2026-10-01T00:00:00.000Z",
    });
    expect(result).toEqual({ ok: true, moved: 1 });
    expect(await ratesOf(september)).toEqual(["Income tax 10.5"]);
    expect(await ratesOf(october)).toEqual(["Income tax 17.5"]);
  });

  test("all shifts: the tax changes in place", async () => {
    const tax = await prisma.tax.findFirstOrThrow({ where: { userId: "u1", value: 17.5 } });
    await onUpdateSalaryItem({
      kind: "tax",
      id: tax.id,
      name: "Income tax",
      value: 18,
      description: null,
      from: null,
    });
    expect(await ratesOf(october)).toEqual(["Income tax 18"]);
    expect(await ratesOf(september)).toEqual(["Income tax 10.5"]);
  });

  test("changing the rate on one shift only touches that shift", async () => {
    const shift = await prisma.hourly.findUniqueOrThrow({
      where: { id: october },
      include: { taxes: true, contributions: true },
    });
    const result = await onEditShift(shift as never, [], [{ id: shift.taxes[0].id, value: 5 }]);
    expect(result).not.toBeNull();
    expect(await ratesOf(october)).toEqual(["Income tax 5"]);
    expect(await ratesOf(september)).toEqual(["Income tax 10.5"]);
  });

  test("someone else's shift and tax can't be edited", async () => {
    const shift = await prisma.hourly.findUniqueOrThrow({
      where: { id: someoneElses },
      include: { taxes: true },
    });
    expect(await onEditShift({ ...shift, name: "changed" } as never, [])).toBeNull();
    expect((await prisma.hourly.findUniqueOrThrow({ where: { id: someoneElses } })).name).toBe(
      "Packhouse"
    );
    const result = await onUpdateSalaryItem({
      kind: "tax",
      id: shift.taxes[0].id,
      name: "x",
      value: 1,
      description: null,
    });
    expect(result.ok).toBe(false);
  });

  test("remove: archived if a shift uses it, deleted if not", async () => {
    const unused = await prisma.tax.findFirstOrThrow({ where: { userId: "u1", value: 18 } });
    expect(await onRemoveSalaryItem({ kind: "tax", id: unused.id })).toEqual({
      ok: true,
      archived: false,
    });
    const used = await prisma.tax.findFirstOrThrow({ where: { userId: "u1", value: 5 } });
    expect(await onRemoveSalaryItem({ kind: "tax", id: used.id })).toEqual({
      ok: true,
      archived: true,
    });
    expect(await ratesOf(october)).toEqual(["Income tax 5"]);
  });
});

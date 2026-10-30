/**
 * End to end on a real SQLite database (every migration in
 * prisma/migrations applied to a temp file), through the app's Prisma
 * client and the real Better Auth instance: sign up, sign in, the session
 * cookie, protected routes, server actions and the password reset. Only
 * Next's request headers and the email sender are stubbed.
 */
import { createClient } from "@libsql/client";
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
    emails: [] as { to: string; html: string }[],
  };
});

vi.mock("next/headers", () => ({
  headers: async () => env.headers,
  cookies: async () => ({ get: () => undefined, set: () => undefined }),
}));
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("resend", () => ({
  Resend: class {
    emails = {
      // Emails go out rendered (services/Email): html and text.
      send: async ({ to, html }: { to: string; html: string }) => {
        env.emails.push({ to, html });
        return { data: { id: "email-1" }, error: null };
      },
    };
  },
}));

import { getRateTable } from "@/services/ExchangeRates";
import { HourlyRecord } from "@/services/Shift/server";

import { auth } from "@/utils/auth";

import { GET as getRates } from "@/app/api/rates/route";
import { GET as getSalaryItems } from "@/app/api/salary-items/route";
import { DELETE as deleteHourly } from "@/app/api/shift/hourly/[id]/route";
import { GET as getHourly } from "@/app/api/shift/hourly/route";
import { DELETE as deleteProduction } from "@/app/api/shift/production/[id]/route";
import { PUT as putUser } from "@/app/api/user/[id]/route";
import onCreateTrackJob from "@/server-actions/create-track";
import onEditShift from "@/server-actions/edit-shift";
import onResetPassword from "@/server-actions/reset-password";
import { onRemoveSalaryItem, onUpdateSalaryItem } from "@/server-actions/salary-items";
import onSendEmailToResetPassword from "@/server-actions/send-email-reset-password";
import onUpdateSettings from "@/server-actions/update-settings";
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

/** Signs in for real and returns the Cookie header the browser would send. */
async function signIn(email: string, password = PASSWORD) {
  const { headers } = await auth.api.signInEmail({
    body: { email, password },
    returnHeaders: true,
  });
  // (The test environment's Headers has no getSetCookie.)
  const cookie = (headers.get("set-cookie") ?? "")
    .split(/,(?=\s*[\w.-]+=)/)
    .map((c) => c.trim().split(";")[0])
    .join("; ");
  return new Headers({ cookie });
}

function requestAs(cookies: Headers, init: RequestInit = {}) {
  return new Request("http://localhost:3000/api", { ...init, headers: cookies }) as never;
}

function idParam(id: number | string) {
  return { params: Promise.resolve({ id: String(id) }) };
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
  const service = new HourlyRecord(shift as never);
  await service.addtaxes([{ name: "Income tax", value: 10.5, description: null }], userId);
  await service.update(shift.id);
  return shift.id;
}

async function ratesOf(id: number) {
  const shift = await prisma.hourly.findUnique({ where: { id }, include: { taxes: true } });
  return shift?.taxes.map((t) => `${t.name} ${t.value}`);
}

describe("auth and taxes on a real database", () => {
  let ana: { id: string; shiftId: number; cookies: Headers };
  let bob: { id: string; shiftId: number };
  let september: number;
  let october: number;
  let bobsShift: number;

  beforeAll(async () => {
    await migrate();

    for (const email of ["ana@x.com", "bob@x.com"]) {
      await auth.api.signUpEmail({ body: { email, password: PASSWORD, name: email } });
    }
    const users = await prisma.user.findMany({
      orderBy: { email: "asc" },
      include: { shifts: true },
    });
    const [a, b] = users;
    ana = { id: a.id, shiftId: a.shifts!.id, cookies: await signIn("ana@x.com") };
    bob = { id: b.id, shiftId: b.shifts!.id };
    env.headers = ana.cookies;

    september = await addShift(ana.shiftId, "2026-09-01T10:00:00", ana.id);
    october = await addShift(ana.shiftId, "2026-10-15T10:00:00", ana.id);
    bobsShift = await addShift(bob.shiftId, "2026-10-15T10:00:00", bob.id);
  });

  describe("Better Auth", () => {
    test("sign-up creates the user, a scrypt credential account, Shift and Config", async () => {
      const user = await prisma.user.findUniqueOrThrow({
        where: { email: "ana@x.com" },
        include: { accounts: true, shifts: true, config: true },
      });
      expect(user.role).toBe("USER");
      expect(user.accounts).toHaveLength(1);
      expect(user.accounts[0].providerId).toBe("credential");
      expect(user.accounts[0].password).not.toContain(PASSWORD);
      expect(user.accounts[0].password?.startsWith("$2")).toBe(false); // not bcrypt
      expect(user.shifts).not.toBeNull();
      expect(user.config?.weekStartsOn).toBe("monday");
    });

    test("a wrong password doesn't sign in", async () => {
      await expect(
        auth.api.signInEmail({ body: { email: "ana@x.com", password: "nope-nope" } })
      ).rejects.toThrow();
    });

    test("the session cookie identifies the user, role included", async () => {
      const session = await auth.api.getSession({ headers: ana.cookies });
      expect(session?.user.email).toBe("ana@x.com");
      expect(session?.user.role).toBe("USER");
    });

    test("protected routes reject requests without a session", async () => {
      const response = await getHourly(requestAs(new Headers()));
      expect(response.status).toBe(401);
    });

    test("password reset: email with our link, then the new password works", async () => {
      env.emails.length = 0;
      expect(await onSendEmailToResetPassword("bob@x.com", "es")).toEqual({ response: true });
      expect(env.emails).toHaveLength(1);
      // The link goes to our own page, in the language the user was using.
      const token = env.emails[0].html.match(/localhost:3000\/es\/reset\/([A-Za-z0-9_-]+)/)?.[1];
      expect(token).toBeTruthy();

      expect(await onResetPassword({ token: token!, password: "Nuevo456!" })).toMatchObject({
        response: true,
      });
      await expect(signIn("bob@x.com", PASSWORD)).rejects.toThrow();
      expect((await signIn("bob@x.com", "Nuevo456!")).get("cookie")).toBeTruthy();
      // The token can't be used twice.
      expect(await onResetPassword({ token: token!, password: "Otro789!x" })).toMatchObject({
        response: false,
      });
    });

    test("reset for an unknown email answers the same and sends nothing", async () => {
      env.emails.length = 0;
      expect(await onSendEmailToResetPassword("nobody@x.com", "en")).toMatchObject({
        response: true,
      });
      expect(env.emails).toHaveLength(0);
    });
  });

  describe("taxes", () => {
    test("each user gets one row per tax, reused across their shifts", async () => {
      const rows = await prisma.tax.findMany();
      expect(rows.map((r) => r.userId).sort()).toEqual([ana.id, bob.id].sort());
    });

    test("dates stored as ISO text or unix ms both read", async () => {
      const raw = createClient({ url: env.url });
      await raw.execute({
        sql: "UPDATE User SET createdAt = '2024-05-01T10:00:00.000+00:00' WHERE id = ?",
        args: [ana.id],
      });
      await raw.execute({
        sql: "UPDATE User SET createdAt = 1714557600000 WHERE id = ?",
        args: [bob.id],
      });
      raw.close();
      const users = await prisma.user.findMany({
        where: { id: { in: [ana.id, bob.id] } },
        select: { createdAt: true },
      });
      expect(users.map((u) => u.createdAt.toISOString())).toEqual([
        "2024-05-01T10:00:00.000Z",
        "2024-05-01T10:00:00.000Z",
      ]);
    });

    test("GET /api/shift/hourly returns only the signed-in user's shifts", async () => {
      const response = await getHourly(requestAs(ana.cookies));
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.hourly.map((h: { id: number }) => h.id).sort()).toEqual([september, october]);
    });

    test("GET /api/salary-items returns the user's taxes with uses", async () => {
      const response = await getSalaryItems(requestAs(ana.cookies));
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.salaryItems.taxes).toMatchObject([
        { name: "Income tax", uses: 2, userId: ana.id },
      ]);
    });

    test("from a date: only later shifts get the new rate", async () => {
      const tax = await prisma.tax.findFirstOrThrow({ where: { userId: ana.id } });
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
      const tax = await prisma.tax.findFirstOrThrow({ where: { userId: ana.id, value: 17.5 } });
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
        where: { id: bobsShift },
        include: { taxes: true },
      });
      expect(await onEditShift({ ...shift, name: "changed" } as never, [])).toBeNull();
      expect((await prisma.hourly.findUniqueOrThrow({ where: { id: bobsShift } })).name).toBe(
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
      const unused = await prisma.tax.findFirstOrThrow({ where: { userId: ana.id, value: 18 } });
      expect(await onRemoveSalaryItem({ kind: "tax", id: unused.id })).toEqual({
        ok: true,
        archived: false,
      });
      const used = await prisma.tax.findFirstOrThrow({ where: { userId: ana.id, value: 5 } });
      expect(await onRemoveSalaryItem({ kind: "tax", id: used.id })).toEqual({
        ok: true,
        archived: true,
      });
      expect(await ratesOf(october)).toEqual(["Income tax 5"]);
    });
  });

  describe("ownership", () => {
    test("DELETE a shift: signed out is 401, someone else's is 404 and stays", async () => {
      expect((await deleteHourly(requestAs(new Headers()), idParam(bobsShift))).status).toBe(401);
      expect((await deleteHourly(requestAs(ana.cookies), idParam(bobsShift))).status).toBe(404);
      expect(await prisma.hourly.findUnique({ where: { id: bobsShift } })).not.toBeNull();
    });

    test("DELETE a production shift that isn't yours is 404 and stays", async () => {
      const bobs = await prisma.production.create({
        data: { startDate: new Date().toString(), shiftId: bob.shiftId, itemValue: 1 },
      });
      expect((await deleteProduction(requestAs(ana.cookies), idParam(bobs.id))).status).toBe(404);
      expect(await prisma.production.findUnique({ where: { id: bobs.id } })).not.toBeNull();
    });

    test("DELETE your own shift works", async () => {
      const mine = await addShift(ana.shiftId, "2026-10-20T10:00:00", ana.id);
      expect((await deleteHourly(requestAs(ana.cookies), idParam(mine))).status).toBe(200);
      expect(await prisma.hourly.findUnique({ where: { id: mine } })).toBeNull();
    });

    test("starting a shift puts it in your container, whatever shiftId the client sends", async () => {
      const result = await onCreateTrackJob({
        startDate: new Date().toString(),
        endDate: null,
        name: "Track",
        amount: 0,
        notes: "",
        isClosed: false,
        isPublicHoliday: false,
        publicHolidayWorked: false,
        holidayRate: null,
        hourValue: 20,
        unpaidBreaks: 0,
        shiftId: bob.shiftId,
        currency: null,
        employerId: null,
        source: "track",
      });
      expect(result?.response).toBe(true);
      expect(result?.shift?.shiftId).toBe(ana.shiftId);
    });

    test("closing someone else's shift does nothing", async () => {
      const before = await prisma.hourly.findUniqueOrThrow({ where: { id: bobsShift } });
      const result = await onUpdateTrackJob(
        { ...before, name: "hijacked", taxes: [], contributions: [] } as never,
        bobsShift
      );
      expect(result).toBeNull();
      expect((await prisma.hourly.findUniqueOrThrow({ where: { id: bobsShift } })).name).toBe(
        "Packhouse"
      );
    });

    test("closing your shift can't move it to another container", async () => {
      const mine = await prisma.hourly.findUniqueOrThrow({ where: { id: september } });
      const result = await onUpdateTrackJob(
        { ...mine, shiftId: bob.shiftId, taxes: [], contributions: [] } as never,
        september
      );
      expect(result?.response).toBe(true);
      expect((await prisma.hourly.findUniqueOrThrow({ where: { id: september } })).shiftId).toBe(
        ana.shiftId
      );
    });

    test("closing your shift only writes what closing can change", async () => {
      const mine = await prisma.hourly.findUniqueOrThrow({ where: { id: september } });
      const result = await onUpdateTrackJob(
        {
          ...mine,
          name: "Closed",
          holidayRate: 9,
          source: "forged",
          taxes: [],
          contributions: [],
        } as never,
        september
      );
      expect(result?.response).toBe(true);
      const after = await prisma.hourly.findUniqueOrThrow({ where: { id: september } });
      expect(after.name).toBe("Closed");
      expect(after.holidayRate).toBe(mine.holidayRate);
      expect(after.source).toBe(mine.source);
    });

    test("a payload that isn't a shift is refused and nothing changes", async () => {
      const mine = await prisma.hourly.findUniqueOrThrow({ where: { id: september } });
      expect(
        await onUpdateTrackJob(
          { ...mine, hourValue: "20", taxes: [], contributions: [] } as never,
          september
        )
      ).toBeNull();
      expect((await prisma.hourly.findUniqueOrThrow({ where: { id: september } })).hourValue).toBe(
        mine.hourValue
      );
    });

    test("PUT /api/user/[id] can't mark your own email as verified", async () => {
      const response = await putUser(
        requestAs(ana.cookies, {
          method: "PUT",
          body: JSON.stringify({ name: "Ana", emailVerified: true, isActive: false }),
        }),
        idParam(ana.id)
      );
      expect(response.status).toBe(200);
      const user = await prisma.user.findUniqueOrThrow({ where: { id: ana.id } });
      expect(user.name).toBe("Ana");
      expect(user.emailVerified).toBe(false);
      expect(user.isActive).toBe(true);
    });
  });

  // Last: it changes Ana's email.
  describe("changing the email in Settings", () => {
    function settings(email: string) {
      return {
        account: { name: "Ana", email },
        personal: { country: "AU", city: "Mildura" },
      } as never;
    }

    test("an email someone else has is refused", async () => {
      const result = await onUpdateSettings(settings("bob@x.com"));
      expect(result).toMatchObject({ type_error: "DataProvidedIsNotValid" });
      expect((await prisma.user.findUniqueOrThrow({ where: { id: ana.id } })).email).toBe(
        "ana@x.com"
      );
    });

    test("a new email is no longer verified", async () => {
      await prisma.user.update({ where: { id: ana.id }, data: { emailVerified: true } });
      expect(await onUpdateSettings(settings("ana.new@x.com"))).not.toBeNull();
      const user = await prisma.user.findUniqueOrThrow({ where: { id: ana.id } });
      expect(user.email).toBe("ana.new@x.com");
      expect(user.emailVerified).toBe(false);
    });
  });
});

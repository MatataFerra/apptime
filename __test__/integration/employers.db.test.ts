/**
 * Employers on a real SQLite database (every migration in
 * prisma/migrations applied to a temp file), through the app's Prisma
 * client, the real Better Auth session, the server actions and the API
 * route. Only Next's request headers and cache are stubbed.
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
  };
});

vi.mock("next/headers", () => ({
  headers: async () => env.headers,
  cookies: async () => ({ get: () => undefined, set: () => undefined }),
}));
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { auth } from "@/utils/auth";

import { GET as getEmployers } from "@/app/api/employers/route";
import onCreateTrackJob from "@/server-actions/create-track";
import onEditShift from "@/server-actions/edit-shift";
import { onCreateEmployer, onRemoveEmployer, onUpdateEmployer } from "@/server-actions/employers";
import onCreateHourlyShift from "@/server-actions/hourly-job";
import onCreateProductionShift from "@/server-actions/production-job";
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

function requestAs(cookies: Headers) {
  return new Request("http://localhost:3000/api/employers", { headers: cookies }) as never;
}

async function listAs(cookies: Headers) {
  const response = await getEmployers(requestAs(cookies));
  return { status: response.status, body: await response.json() };
}

describe("employers on a real database", () => {
  let ana: { id: string; cookies: Headers };
  let bob: { id: string; cookies: Headers };
  let farm: number;

  beforeAll(async () => {
    await migrate();
    for (const email of ["ana@x.com", "bob@x.com"]) {
      await auth.api.signUpEmail({ body: { email, password: PASSWORD, name: email } });
    }
    const [a, b] = await prisma.user.findMany({ orderBy: { email: "asc" } });
    ana = { id: a.id, cookies: await signIn("ana@x.com") };
    bob = { id: b.id, cookies: await signIn("bob@x.com") };
  });

  test("creates an employer for the signed-in user, with every detail", async () => {
    env.headers = ana.cookies;
    const result = await onCreateEmployer({
      name: "Sunny Farms",
      taxId: "51 824 753 556",
      address: "12 Packhouse Rd",
      city: "Bundaberg",
      postcode: "4670",
      country: "Australia",
      industry: "Farming",
      contactName: "Liz",
      contactEmail: "jobs@sunny.com.au",
      contactPhone: "+61 400 000 000",
      defaultRate: 31.5,
      defaultCurrency: "AUD",
      notes: "Picking season Nov–Feb",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    farm = result.id;

    const saved = await prisma.employer.findUniqueOrThrow({ where: { id: farm } });
    expect(saved).toMatchObject({
      userId: ana.id,
      name: "Sunny Farms",
      postcode: "4670",
      defaultRate: 31.5,
      defaultCurrency: "AUD",
      archived: false,
    });
    expect(saved.createdAt).toBeInstanceOf(Date);
  });

  test("returns field errors and saves nothing for bad input", async () => {
    env.headers = ana.cookies;
    const result = await onCreateEmployer({ name: "", contactEmail: "nope" });
    expect(result).toMatchObject({
      ok: false,
      fields: { name: "employer_name_required", contactEmail: "employer_email_invalid" },
    });
    expect(await prisma.employer.count({ where: { userId: ana.id } })).toBe(1);
  });

  test("the API lists only the user's own employers, without owner fields", async () => {
    env.headers = bob.cookies;
    await onCreateEmployer({ name: "Bob's Vineyard" });

    const asAna = await listAs(ana.cookies);
    expect(asAna.status).toBe(200);
    expect(asAna.body.employers.map((e: { name: string }) => e.name)).toEqual(["Sunny Farms"]);
    expect(asAna.body.employers[0]).not.toHaveProperty("userId");
    expect(asAna.body.employers[0]).toMatchObject({ archived: false, shifts: 0 });

    const asBob = await listAs(bob.cookies);
    expect(asBob.body.employers.map((e: { name: string }) => e.name)).toEqual(["Bob's Vineyard"]);
  });

  test("the API needs a session", async () => {
    const { status } = await listAs(new Headers());
    expect(status).toBe(401);
  });

  test("a lookup's source is saved, and an edit without a new lookup keeps it", async () => {
    env.headers = ana.cookies;
    const at = new Date(Date.now() - 60_000).toISOString();
    const created = await onCreateEmployer({
      name: "Kiwi Orchards",
      country: "New Zealand",
      source: { registry: "nzbn", at },
    });
    if (!created.ok) throw new Error("create");

    const saved = await prisma.employer.findUniqueOrThrow({ where: { id: created.id } });
    expect(saved).toMatchObject({ sourceRegistry: "nzbn", sourcedAt: new Date(at) });

    expect((await onUpdateEmployer(created.id, { name: "Kiwi Orchards Ltd" })).ok).toBe(true);
    expect(await prisma.employer.findUniqueOrThrow({ where: { id: created.id } })).toMatchObject({
      name: "Kiwi Orchards Ltd",
      sourceRegistry: "nzbn",
    });

    const listed = (await listAs(ana.cookies)).body.employers.find(
      (e: { id: number }) => e.id === created.id
    );
    expect(listed).toMatchObject({ sourceRegistry: "nzbn", sourcedAt: new Date(at).toISOString() });

    await onRemoveEmployer(created.id);
  });

  test("updates an employer and clears the fields left empty", async () => {
    env.headers = ana.cookies;
    const result = await onUpdateEmployer(farm, {
      name: "Sunny Farms Pty Ltd",
      postcode: "4670",
      contactPhone: "",
      defaultRate: 32,
    });
    expect(result.ok).toBe(true);

    const saved = await prisma.employer.findUniqueOrThrow({ where: { id: farm } });
    expect(saved).toMatchObject({
      name: "Sunny Farms Pty Ltd",
      contactPhone: null,
      defaultRate: 32,
      defaultCurrency: null,
    });
  });

  test("someone else's employer can't be edited or removed", async () => {
    env.headers = bob.cookies;
    expect(await onUpdateEmployer(farm, { name: "Mine now" })).toMatchObject({
      ok: false,
      error: "not_found",
    });
    expect(await onRemoveEmployer(farm)).toMatchObject({ ok: false, error: "not_found" });
    expect((await prisma.employer.findUniqueOrThrow({ where: { id: farm } })).name).toBe(
      "Sunny Farms Pty Ltd"
    );
  });

  test("without a session nothing is saved", async () => {
    env.headers = new Headers();
    expect(await onCreateEmployer({ name: "Ghost" })).toMatchObject({ ok: false });
    expect(await prisma.employer.count({ where: { name: "Ghost" } })).toBe(0);
  });

  describe("shifts and employers", () => {
    let packhouse: number;
    let bobsEmployer: number;

    function fastShift(employerId: number | null) {
      return {
        startDate: new Date("2026-10-20T08:00:00").toString(),
        endDate: new Date("2026-10-20T16:00:00").toString(),
        hourValue: 30,
        name: "Packing",
        isPublicHoliday: false,
        isWorked: false,
        unpaidBreaks: 30,
        taxes: [],
        contributions: [],
        currency: null,
        employerId,
      };
    }

    beforeAll(async () => {
      env.headers = bob.cookies;
      const bobs = await onCreateEmployer({ name: "Bob's Orchard" });
      env.headers = ana.cookies;
      const ours = await onCreateEmployer({ name: "Packhouse Co", defaultRate: 30 });
      if (!bobs.ok || !ours.ok) throw new Error("setup");
      bobsEmployer = bobs.id;
      packhouse = ours.id;
    });

    test("a Fast shift saves one of the user's employers", async () => {
      env.headers = ana.cookies;
      const result = await onCreateHourlyShift(fastShift(packhouse));
      expect(result?.response).toBe(true);
      const id = (result?.createShift as { id: number }).id;
      expect((await prisma.hourly.findUniqueOrThrow({ where: { id } })).employerId).toBe(packhouse);
    });

    test("a production and a tracked shift save it too", async () => {
      env.headers = ana.cookies;
      const production = await onCreateProductionShift({
        startDate: new Date("2026-10-21T08:00:00").toString(),
        endDate: new Date("2026-10-21T12:00:00").toString(),
        name: "Picking",
        itemValue: 2,
        itemQuantity: 50,
        isPublicHoliday: false,
        publicHolidayWorked: false,
        taxes: [],
        contributions: [],
        currency: null,
        employerId: packhouse,
      });
      expect(production?.response).toBe(true);

      const track = await onCreateTrackJob({
        startDate: new Date("2026-10-22T08:00:00").toString(),
        endDate: null,
        name: "Packing",
        amount: 0,
        notes: "",
        isClosed: false,
        isPublicHoliday: false,
        publicHolidayWorked: false,
        hourValue: 30,
        unpaidBreaks: 30,
        shiftId: null,
        currency: null,
        employerId: packhouse,
        source: "track",
      });
      expect(track?.shift?.employerId).toBe(packhouse);
    });

    test("someone else's employer is refused and nothing is saved", async () => {
      env.headers = ana.cookies;
      const before = await prisma.hourly.count();
      expect(await onCreateHourlyShift(fastShift(bobsEmployer))).toBeNull();
      expect(
        await onCreateTrackJob({
          startDate: new Date("2026-10-23T08:00:00").toString(),
          endDate: null,
          name: null,
          amount: 0,
          notes: "",
          isClosed: false,
          isPublicHoliday: false,
          publicHolidayWorked: false,
          hourValue: 30,
          unpaidBreaks: 0,
          shiftId: null,
          currency: null,
          employerId: bobsEmployer,
          source: "track",
        })
      ).toBeNull();
      expect(await prisma.hourly.count()).toBe(before);
    });

    test("editing a shift can clear its employer, but not point it at someone else's", async () => {
      env.headers = ana.cookies;
      const shift = await prisma.hourly.findFirstOrThrow({
        where: { employerId: packhouse, source: "fast" },
        include: { taxes: true },
      });

      expect(await onEditShift({ ...shift, employerId: bobsEmployer } as never, [])).toBeNull();
      expect((await prisma.hourly.findUniqueOrThrow({ where: { id: shift.id } })).employerId).toBe(
        packhouse
      );

      expect(await onEditShift({ ...shift, employerId: null } as never, [])).not.toBeNull();
      expect(
        (await prisma.hourly.findUniqueOrThrow({ where: { id: shift.id } })).employerId
      ).toBeNull();
    });

    test("removing an employer with shifts archives it; its shifts keep it", async () => {
      env.headers = ana.cookies;
      expect(await onRemoveEmployer(packhouse)).toMatchObject({ ok: true, archived: true });

      const saved = await prisma.employer.findUniqueOrThrow({ where: { id: packhouse } });
      expect(saved.archived).toBe(true);
      expect(await prisma.production.count({ where: { employerId: packhouse } })).toBe(1);

      const listed = (await listAs(ana.cookies)).body.employers.find(
        (e: { id: number }) => e.id === packhouse
      );
      expect(listed).toMatchObject({ archived: true, shifts: 2 });

      // Already removed: a second remove finds nothing.
      expect(await onRemoveEmployer(packhouse)).toMatchObject({ ok: false });
    });
  });

  test("removes an employer", async () => {
    env.headers = ana.cookies;
    expect(await onRemoveEmployer(farm)).toMatchObject({ ok: true });
    expect(await prisma.employer.findUnique({ where: { id: farm } })).toBeNull();
    // Only the archived one from the shift tests is left.
    const left = (await listAs(ana.cookies)).body.employers;
    expect(left.map((e: { name: string; archived: boolean }) => [e.name, e.archived])).toEqual([
      ["Packhouse Co", true],
    ]);
  });

  test("deleting a user deletes their employers", async () => {
    await prisma.user.delete({ where: { id: bob.id } });
    expect(await prisma.employer.count({ where: { userId: bob.id } })).toBe(0);
  });
});

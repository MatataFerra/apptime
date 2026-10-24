import { beforeEach, describe, expect, test, vi } from "vitest";

const db = vi.hoisted(() => {
  function model() {
    return {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
    };
  }
  return {
    tax: model(),
    contribution: model(),
    employer: model(),
    hourly: model(),
    production: model(),
    $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
  };
});

const session = vi.hoisted(() => ({
  user: vi.fn(async () => ({ id: "u1", shifts: { id: 7 } }) as unknown),
}));

vi.mock("#/prisma/client", () => ({ default: db }));
vi.mock("../../prisma/client", () => ({ default: db }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/services/User", () => ({ default: { getSessionUser: session.user } }));

import onCreateHourlyBatch, { type HourlyBatchInput } from "@/server-actions/hourly-batch";

function at(d: number, h: number) {
  return new Date(2026, 9, d, h).toString();
}

function input(overrides: Partial<HourlyBatchInput> = {}): HourlyBatchInput {
  return {
    name: "  Packhouse ",
    hourValue: 26.5,
    unpaidBreaks: 30,
    currency: "AUD",
    employerId: null,
    taxes: [{ name: "Income tax", value: 15, description: null }],
    contributions: [],
    shifts: [
      { startDate: at(5, 8), endDate: at(5, 16) },
      { startDate: at(6, 8), endDate: at(6, 16) },
      { startDate: at(7, 8), endDate: at(7, 16) },
    ],
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  db.hourly.findMany.mockResolvedValue([]);
  db.production.findMany.mockResolvedValue([]);
  db.tax.findMany.mockResolvedValue([]);
  db.contribution.findMany.mockResolvedValue([]);
  db.tax.create.mockResolvedValue({ id: 3 });
  db.hourly.create.mockImplementation(async () => ({ id: 1 }));
});

describe("onCreateHourlyBatch", () => {
  test("saves every shift in one transaction, sharing the tax rows", async () => {
    const result = await onCreateHourlyBatch(input());

    expect(result).toEqual({ created: 3, skipped: [] });
    expect(db.$transaction).toHaveBeenCalledTimes(1);
    // The tax is created once, not once per shift.
    expect(db.tax.create).toHaveBeenCalledTimes(1);
    expect(db.hourly.create).toHaveBeenCalledTimes(3);

    const { data } = db.hourly.create.mock.calls[0][0];
    expect(data).toMatchObject({
      name: "Packhouse",
      shiftId: 7,
      hourValue: 26.5,
      unpaidBreaks: 30,
      currency: "AUD",
      isClosed: true,
      amount: 480,
      source: "fast",
      taxes: { connect: [{ id: 3 }] },
    });
  });

  test("skips the days that run into a saved shift", async () => {
    db.production.findMany.mockResolvedValue([{ startDate: at(6, 12), endDate: at(6, 18) }]);

    const result = await onCreateHourlyBatch(input());

    expect(result?.created).toBe(2);
    expect(result?.skipped).toEqual([{ startDate: at(6, 8), endDate: at(6, 16) }]);
    expect(db.hourly.create).toHaveBeenCalledTimes(2);
  });

  test("nothing is created when every day clashes", async () => {
    db.hourly.findMany.mockResolvedValue([{ startDate: at(1, 0), endDate: at(20, 0) }]);

    expect(await onCreateHourlyBatch(input())).toEqual({
      created: 0,
      skipped: input().shifts,
    });
    expect(db.$transaction).not.toHaveBeenCalled();
    expect(db.tax.create).not.toHaveBeenCalled();
  });

  test("someone else's employer refuses the whole batch", async () => {
    db.employer.findFirst.mockResolvedValue(null);
    expect(await onCreateHourlyBatch(input({ employerId: 99 }))).toBeNull();
    expect(db.hourly.create).not.toHaveBeenCalled();
  });

  test.each([
    ["no shifts", { shifts: [] }],
    ["too many shifts", { shifts: Array.from({ length: 63 }, () => input().shifts[0]) }],
    ["a finish before the start", { shifts: [{ startDate: at(5, 16), endDate: at(5, 8) }] }],
    ["a shift over 24h", { shifts: [{ startDate: at(5, 8), endDate: at(6, 9) }] }],
    ["a bad date", { shifts: [{ startDate: "nope", endDate: at(5, 8) }] }],
    ["a negative rate", { hourValue: -1 }],
  ])("refuses %s", async (_, overrides) => {
    expect(await onCreateHourlyBatch(input(overrides as Partial<HourlyBatchInput>))).toBeNull();
    expect(db.hourly.create).not.toHaveBeenCalled();
  });

  test("needs a signed-in user with a shift container", async () => {
    session.user.mockResolvedValueOnce(null);
    expect(await onCreateHourlyBatch(input())).toBeNull();
    session.user.mockResolvedValueOnce({ id: "u1", shifts: null });
    expect(await onCreateHourlyBatch(input())).toBeNull();
  });
});

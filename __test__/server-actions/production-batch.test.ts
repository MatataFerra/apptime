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

vi.mock("#/prisma/client", () => ({ default: db }));
vi.mock("../../prisma/client", () => ({ default: db }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/services/User", () => ({
  default: { getSessionUser: vi.fn(async () => ({ id: "u1", shifts: { id: 7 } })) },
}));

import onCreateProductionBatch, {
  type ProductionBatchInput,
} from "@/server-actions/production-batch";

function at(d: number, h: number) {
  return new Date(2026, 9, d, h).toString();
}

function input(overrides: Partial<ProductionBatchInput> = {}): ProductionBatchInput {
  return {
    name: "Picking",
    itemValue: 38,
    currency: null,
    employerId: null,
    taxes: [],
    contributions: [{ name: "Super", value: 11.5, description: null }],
    shifts: [
      { startDate: at(5, 7), endDate: at(5, 15), itemQuantity: 4 },
      { startDate: at(6, 7), endDate: at(6, 15), itemQuantity: 6.5 },
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
  db.contribution.create.mockResolvedValue({ id: 9 });
  db.production.create.mockImplementation(async () => ({ id: 1 }));
});

describe("onCreateProductionBatch", () => {
  test("each shift keeps its own quantity; rate and contributions are shared", async () => {
    expect(await onCreateProductionBatch(input())).toEqual({ created: 2, skipped: [] });

    expect(db.$transaction).toHaveBeenCalledTimes(1);
    expect(db.contribution.create).toHaveBeenCalledTimes(1);
    expect(db.hourly.create).not.toHaveBeenCalled();

    const rows = db.production.create.mock.calls.map(([arg]) => arg.data);
    expect(rows.map((r) => r.itemQuantity)).toEqual([4, 6.5]);
    expect(rows[0]).toMatchObject({
      name: "Picking",
      itemValue: 38,
      shiftId: 7,
      isClosed: true,
      amount: 480,
      contributions: { connect: [{ id: 9 }] },
    });
  });

  test("a day already logged as hourly is skipped", async () => {
    db.hourly.findMany.mockResolvedValue([{ startDate: at(5, 12), endDate: at(5, 13) }]);

    const result = await onCreateProductionBatch(input());

    expect(result?.created).toBe(1);
    expect(result?.skipped).toEqual([input().shifts[0]]);
  });

  test.each([
    ["a missing quantity", { shifts: [{ startDate: at(5, 7), endDate: at(5, 15) }] }],
    [
      "a negative quantity",
      { shifts: [{ startDate: at(5, 7), endDate: at(5, 15), itemQuantity: -1 }] },
    ],
    ["a negative rate", { itemValue: -2 }],
    [
      "a finish before the start",
      { shifts: [{ startDate: at(5, 15), endDate: at(5, 7), itemQuantity: 1 }] },
    ],
  ])("refuses %s", async (_, overrides) => {
    expect(
      await onCreateProductionBatch(input(overrides as Partial<ProductionBatchInput>))
    ).toBeNull();
    expect(db.production.create).not.toHaveBeenCalled();
  });
});

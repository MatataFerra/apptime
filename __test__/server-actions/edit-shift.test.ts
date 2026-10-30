import { beforeEach, describe, expect, test, vi } from "vitest";

const db = vi.hoisted(() => {
  function model() {
    return {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };
  }
  return {
    tax: model(),
    hourly: model(),
    production: model(),
    $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
  };
});

vi.mock("#/prisma/client", () => ({ default: db }));
vi.mock("../../prisma/client", () => ({ default: db }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/services/User", () => ({
  default: { getSessionOwner: vi.fn(async () => ({ id: "u1", shifts: { id: 7 } })) },
}));

import type { HourlyType, ProductionType } from "@/types";

import onEditShift from "@/server-actions/edit-shift";

const shift = {
  id: 11,
  shiftId: 999, // someone else's container: must be ignored
  name: "Packhouse",
  startDate: new Date("2026-10-02T08:00:00").toString(),
  endDate: new Date("2026-10-02T16:00:00").toString(),
  hourValue: 26.5,
  unpaidBreaks: 30,
  amount: 480,
  isPublicHoliday: false,
  publicHolidayWorked: false,
  isClosed: true,
  notes: "",
  currency: null,
  source: null,
  taxes: [],
  contributions: [],
} as unknown as HourlyType;

const productionShift = {
  id: 11,
  name: "Picking",
  startDate: new Date("2026-10-02T08:00:00").toString(),
  endDate: new Date("2026-10-02T16:00:00").toString(),
  itemValue: 0,
  itemQuantity: 40,
  isPublicHoliday: false,
  publicHolidayWorked: false,
  isClosed: true,
  notes: "",
  currency: null,
  taxes: [],
  contributions: [],
} as unknown as ProductionType;

beforeEach(() => {
  vi.clearAllMocks();
  db.hourly.update.mockResolvedValue({ id: 11 });
  db.production.update.mockResolvedValue({ id: 11 });
});

describe("onEditShift", () => {
  test("a shift that isn't yours is not edited", async () => {
    db.hourly.findFirst.mockResolvedValue(null);
    expect(await onEditShift(shift)).toBeNull();
    expect(db.hourly.update).not.toHaveBeenCalled();
  });

  test("a new rate moves only this shift to a tax with that rate", async () => {
    db.hourly.findFirst.mockResolvedValue({
      id: 11,
      taxes: [{ id: 1, name: "Income tax", description: "PAYE" }],
    });
    db.tax.findFirst.mockResolvedValue(null);
    db.tax.create.mockResolvedValue({ id: 2 });

    await onEditShift(shift, [], [{ id: 1, value: 17.5 }]);

    // The shift stays in the user's own container.
    expect(db.hourly.update.mock.calls[0][0].data.shiftId).toBe(7);
    expect(db.tax.create).toHaveBeenCalledWith({
      data: { userId: "u1", name: "Income tax", value: 17.5, description: "PAYE" },
    });
    expect(db.hourly.update).toHaveBeenCalledWith({
      where: { id: 11 },
      data: { taxes: { disconnect: { id: 1 }, connect: { id: 2 } } },
      select: { id: true },
    });
    // The original tax row isn't touched.
    expect(db.tax.update).not.toHaveBeenCalled();
  });

  test("a tax that isn't on the shift is ignored", async () => {
    db.hourly.findFirst.mockResolvedValue({ id: 11, taxes: [] });
    await onEditShift(shift, [], [{ id: 5, value: 1 }]);
    expect(db.tax.create).not.toHaveBeenCalled();
    expect(db.hourly.update).toHaveBeenCalledTimes(1);
  });

  // Hourly and production rows have separate ids, so checking one table and
  // writing the other would edit someone else's shift.
  test.each([0, null])(
    "a production shift with itemValue %s is checked and written as production",
    async (itemValue) => {
      db.production.findFirst.mockResolvedValue({ id: 11, taxes: [] });
      await onEditShift({ ...productionShift, itemValue } as ProductionType);
      expect(db.production.findFirst).toHaveBeenCalled();
      expect(db.production.update).toHaveBeenCalledTimes(1);
      expect(db.hourly.findFirst).not.toHaveBeenCalled();
      expect(db.hourly.update).not.toHaveBeenCalled();
    }
  );

  test("server-owned fields sent by the client aren't written", async () => {
    db.hourly.findFirst.mockResolvedValue({ id: 11, taxes: [] });
    await onEditShift({
      ...shift,
      holidayRate: 9,
      source: "fast",
      shift: { connect: { id: 999 } },
    } as unknown as HourlyType);

    const { where, data } = db.hourly.update.mock.calls[0][0];
    expect(where).toEqual({ id: 11 });
    expect(data.shiftId).toBe(7);
    expect(data).not.toHaveProperty("holidayRate");
    expect(data).not.toHaveProperty("source");
    expect(data).not.toHaveProperty("shift");
    expect(data).not.toHaveProperty("id");
  });

  test("a payload that doesn't look like a shift is refused before any query", async () => {
    expect(await onEditShift({ ...shift, hourValue: "26.5" } as unknown as HourlyType)).toBeNull();
    expect(db.hourly.findFirst).not.toHaveBeenCalled();
  });
});

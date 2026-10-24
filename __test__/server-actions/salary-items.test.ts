import { beforeEach, describe, expect, test, vi } from "vitest";

const db = vi.hoisted(() => {
  function model() {
    return {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    };
  }
  return {
    user: { findUnique: vi.fn() },
    tax: model(),
    contribution: model(),
    hourly: model(),
    production: model(),
    $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
  };
});

vi.mock("#/prisma/client", () => ({ default: db }));
vi.mock("@/utils/auth/session", () => ({
  getSessionUserId: vi.fn(async () => "u1"),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { onUpdateSalaryItem } from "@/server-actions/salary-items";

const incomeTax = {
  id: 1,
  name: "Income tax",
  value: 10.5,
  description: null,
  archived: false,
  userId: "u1",
};
const edit = { kind: "tax" as const, id: 1, name: "Income tax", value: 17.5, description: null };

beforeEach(() => {
  vi.clearAllMocks();
  db.user.findUnique.mockResolvedValue({ id: "u1" });
  db.hourly.update.mockResolvedValue({ id: 0 });
});

describe("onUpdateSalaryItem", () => {
  test("someone else's tax is not found", async () => {
    db.tax.findFirst.mockResolvedValueOnce(null);
    const result = await onUpdateSalaryItem(edit);
    expect(result).toEqual({ ok: false, error: "not_found" });
    expect(db.tax.findFirst).toHaveBeenCalledWith({ where: { id: 1, userId: "u1" } });
    expect(db.tax.update).not.toHaveBeenCalled();
  });

  test("all shifts: the tax itself changes", async () => {
    db.tax.findFirst.mockResolvedValueOnce(incomeTax);
    const result = await onUpdateSalaryItem({ ...edit, from: null });
    expect(result).toEqual({ ok: true, moved: null });
    expect(db.tax.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { name: "Income tax", value: 17.5, description: null },
    });
    expect(db.hourly.update).not.toHaveBeenCalled();
  });

  test("from a date: only later shifts move to the new rate, the old one is archived", async () => {
    db.tax.findFirst
      .mockResolvedValueOnce(incomeTax) // owner check
      .mockResolvedValueOnce(null); // no saved tax at 17.5% yet
    db.tax.create.mockResolvedValue({ id: 2 });
    db.hourly.findMany.mockResolvedValue([
      { id: 10, startDate: new Date("2026-09-30T22:00:00Z").toString() },
      { id: 11, startDate: new Date("2026-10-02T08:00:00Z").toString() },
    ]);
    db.production.findMany.mockResolvedValue([]);
    db.tax.findUnique.mockResolvedValue({ hourly: [{ id: 10 }], production: [] });

    const result = await onUpdateSalaryItem({ ...edit, from: "2026-10-01T00:00:00.000Z" });

    expect(result).toEqual({ ok: true, moved: 1 });
    expect(db.tax.create).toHaveBeenCalledWith({
      data: { userId: "u1", name: "Income tax", value: 17.5, description: null },
    });
    expect(db.hourly.update).toHaveBeenCalledTimes(1);
    expect(db.hourly.update).toHaveBeenCalledWith({
      where: { id: 11 },
      data: { taxes: { disconnect: { id: 1 }, connect: { id: 2 } } },
      select: { id: true },
    });
    // Shift 10 still uses it, so it's kept but no longer offered.
    expect(db.tax.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { archived: true } });
    expect(db.tax.delete).not.toHaveBeenCalled();
  });

  test("from a date before every shift: the old tax ends up unused and is deleted", async () => {
    db.tax.findFirst.mockResolvedValueOnce(incomeTax).mockResolvedValueOnce(null);
    db.tax.create.mockResolvedValue({ id: 2 });
    db.hourly.findMany.mockResolvedValue([
      { id: 11, startDate: new Date("2026-10-02T08:00:00Z").toString() },
    ]);
    db.production.findMany.mockResolvedValue([]);
    db.tax.findUnique.mockResolvedValue({ hourly: [], production: [] });

    await onUpdateSalaryItem({ ...edit, from: "2020-01-01T00:00:00.000Z" });

    expect(db.tax.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});

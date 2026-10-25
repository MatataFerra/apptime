import { beforeEach, describe, expect, test, vi } from "vitest";

const db = vi.hoisted(() => ({
  hourly: { updateMany: vi.fn(), deleteMany: vi.fn() },
  production: { updateMany: vi.fn(), deleteMany: vi.fn() },
  employer: { findFirst: vi.fn() },
  $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
}));
const session = vi.hoisted(() => ({ user: { id: "u1", shifts: { id: 7 } } as unknown }));

vi.mock("#/prisma/client", () => ({ default: db }));
vi.mock("../../prisma/client", () => ({ default: db }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/services/User", () => ({
  default: { getSessionOwner: vi.fn(async () => session.user) },
}));

import { idsByKind, selectionKey } from "@/services/Shift/selection";

import onDeleteShiftsBatch from "@/server-actions/delete-shifts-batch";
import onEditShiftsBatch from "@/server-actions/edit-shifts-batch";

const ids = { hourly: [1, 2], production: [3] };

beforeEach(() => {
  vi.clearAllMocks();
  session.user = { id: "u1", shifts: { id: 7 } };
  db.hourly.updateMany.mockResolvedValue({ count: 2 });
  db.production.updateMany.mockResolvedValue({ count: 1 });
  db.hourly.deleteMany.mockResolvedValue({ count: 2 });
  db.production.deleteMany.mockResolvedValue({ count: 1 });
});

describe("onEditShiftsBatch", () => {
  test("only updates the user's own shifts", async () => {
    db.employer.findFirst.mockResolvedValue({ id: 4 });

    const res = await onEditShiftsBatch({ ids, changes: { employerId: 4 } });

    expect(res).toEqual({ hourly: 2, production: 1 });
    expect(db.employer.findFirst).toHaveBeenCalledWith({
      where: { id: 4, userId: "u1" },
      select: { id: true },
    });
    expect(db.hourly.updateMany).toHaveBeenCalledWith({
      where: { id: { in: [1, 2] }, shift: { userId: "u1" } },
      data: { employerId: 4 },
    });
    expect(db.production.updateMany).toHaveBeenCalledWith({
      where: { id: { in: [3] }, shift: { userId: "u1" } },
      data: { employerId: 4 },
    });
  });

  test("someone else's employer is refused", async () => {
    db.employer.findFirst.mockResolvedValue(null);
    expect(await onEditShiftsBatch({ ids, changes: { employerId: 99 } })).toBeNull();
    expect(db.hourly.updateMany).not.toHaveBeenCalled();
  });

  test("the rate goes to hourly shifts only, the piece value to per piece only", async () => {
    await onEditShiftsBatch({ ids, changes: { hourValue: 30, itemValue: 0.8 } });

    expect(db.hourly.updateMany.mock.calls[0][0].data).toEqual({ hourValue: 30 });
    expect(db.production.updateMany.mock.calls[0][0].data).toEqual({ itemValue: 0.8 });
  });

  test("a change for one kind leaves the other kind alone", async () => {
    await onEditShiftsBatch({ ids, changes: { hourValue: 30 } });

    expect(db.production.updateMany.mock.calls[0][0].where.id).toEqual({ in: [] });
  });

  test("holiday, currency and an empty name map onto the shift fields", async () => {
    await onEditShiftsBatch({
      ids,
      changes: { holiday: "worked", currency: "NZD", name: "  " },
    });

    expect(db.hourly.updateMany.mock.calls[0][0].data).toEqual({
      isPublicHoliday: true,
      publicHolidayWorked: true,
      currency: "NZD",
      name: null,
    });
  });

  test.each([
    ["no changes", { ids, changes: {} }],
    ["an unknown field", { ids, changes: { shiftId: 3 } }],
    ["an unknown currency", { ids, changes: { currency: "XXX" } }],
    ["a negative rate", { ids, changes: { hourValue: -1 } }],
    ["no shifts", { ids: { hourly: [], production: [] }, changes: { name: "x" } }],
  ])("refuses %s", async (_, input) => {
    expect(await onEditShiftsBatch(input as never)).toBeNull();
    expect(db.hourly.updateMany).not.toHaveBeenCalled();
  });

  test("signed out does nothing", async () => {
    session.user = null;
    expect(await onEditShiftsBatch({ ids, changes: { name: "x" } })).toBeNull();
    expect(db.$transaction).not.toHaveBeenCalled();
  });
});

describe("onDeleteShiftsBatch", () => {
  test("deletes only the user's own shifts", async () => {
    expect(await onDeleteShiftsBatch({ ids })).toEqual({ hourly: 2, production: 1 });
    expect(db.hourly.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: [1, 2] }, shift: { userId: "u1" } },
    });
    expect(db.production.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: [3] }, shift: { userId: "u1" } },
    });
  });

  test("refuses bad ids", async () => {
    expect(await onDeleteShiftsBatch({ ids: { hourly: [-1], production: [] } })).toBeNull();
    expect(db.hourly.deleteMany).not.toHaveBeenCalled();
  });
});

describe("idsByKind", () => {
  test("splits selection keys by kind and drops junk", () => {
    const keys = [selectionKey("hourly", 1), selectionKey("production", 1), "hourly-x", "x-2"];
    expect(idsByKind(keys)).toEqual({ hourly: [1], production: [1] });
  });
});

import { beforeEach, describe, expect, test, vi } from "vitest";

const tax = vi.hoisted(() => ({
  findMany: vi.fn(),
  create: vi.fn(),
  updateMany: vi.fn(),
}));
vi.mock("#/prisma/client", () => ({ default: { tax } }));

import TaxService from "@/services/Tax";

const saved = [
  { id: 1, name: "Income tax", value: 10.5, description: null, archived: false, userId: "u1" },
];

describe("TaxService reuse", () => {
  test("reuses a saved tax only when name and rate match", () => {
    const [same] = new TaxService(
      [{ name: "Income tax", value: 10.5, description: null }],
      "u1"
    ).prepareTaxesToCreate(saved);
    expect(same).toMatchObject({ exists: true, id: 1 });
  });

  test("same name with another rate is a new tax, not someone else's", () => {
    const [other] = new TaxService(
      [{ name: "Income tax", value: 17.5, description: null }],
      "u1"
    ).prepareTaxesToCreate(saved);
    expect(other.exists).toBe(false);
  });
});

describe("TaxService per user", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("only looks at the user's own taxes and creates new ones for them", async () => {
    tax.findMany.mockResolvedValue([]);
    tax.create.mockResolvedValue({ id: 9 });

    const ids = await new TaxService(
      [{ name: "ACC", value: 1.6, description: null }],
      "u2"
    ).create();

    expect(tax.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: "u2" } }));
    expect(tax.create).toHaveBeenCalledWith({
      data: { name: "ACC", value: 1.6, userId: "u2", description: null },
    });
    expect(ids).toEqual([{ id: 9 }]);
  });

  test("typing a removed tax again brings it back instead of duplicating it", async () => {
    tax.findMany.mockResolvedValue([
      { id: 4, name: "ACC", value: 1.6, description: null, archived: true, userId: "u2" },
    ]);

    const ids = await new TaxService(
      [{ name: "ACC", value: 1.6, description: null }],
      "u2"
    ).create();

    expect(tax.create).not.toHaveBeenCalled();
    expect(tax.updateMany).toHaveBeenCalledWith({
      where: { id: { in: [4] }, userId: "u2" },
      data: { archived: false },
    });
    expect(ids).toEqual([{ id: 4 }]);
  });
});

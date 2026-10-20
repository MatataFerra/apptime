import { describe, expect, test, vi } from "vitest";

vi.mock("#/prisma/client", () => ({ default: {} }));

import TaxService from "@/services/Tax";

const saved = [{ id: 1, name: "Income tax", value: 10.5, description: null }];

describe("TaxService reuse", () => {
  test("reuses a saved tax only when name and rate match", () => {
    const [same] = new TaxService([
      { name: "Income tax", value: 10.5, description: null },
    ]).prepareTaxesToCreate(saved);
    expect(same).toMatchObject({ exists: true, id: 1 });
  });

  test("same name with another rate is a new tax, not someone else's", () => {
    const [other] = new TaxService([
      { name: "Income tax", value: 17.5, description: null },
    ]).prepareTaxesToCreate(saved);
    expect(other.exists).toBe(false);
  });
});

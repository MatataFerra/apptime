import { describe, expect, test } from "vitest";

import { effectiveRate } from "@/components/structures/SalaryItems/TaxPicker";

describe("effectiveRate", () => {
  test("compounds taxes like Pay.afterTax", () => {
    expect(effectiveRate([{ value: 10.5 }, { value: 2 }])).toBe(12.3);
    expect(effectiveRate([])).toBe(0);
  });
});

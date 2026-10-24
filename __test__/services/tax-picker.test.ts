import { describe, expect, test } from "vitest";

import { effectiveRate } from "@/components/structures/SalaryItems/TaxPicker";

import {
  sameSalaryItem,
  useHourlyTaxesOrContributionsStore,
} from "@/store/useTaxOrContributionStore";

describe("effectiveRate", () => {
  test("compounds taxes like Pay.afterTax", () => {
    expect(effectiveRate([{ value: 10.5 }, { value: 2 }])).toBe(12.3);
    expect(effectiveRate([])).toBe(0);
  });
});

describe("sameSalaryItem", () => {
  test("name and rate make a tax: same name with another rate is another tax", () => {
    expect(
      sameSalaryItem(
        { name: "Social Security", value: 11 },
        { name: " social security", value: 11 }
      )
    ).toBe(true);
    expect(
      sameSalaryItem({ name: "Social Security", value: 11 }, { name: "Social Security", value: 8 })
    ).toBe(false);
  });

  test("the store keeps both rates and removes only the one tapped", () => {
    const { taxesModule } = useHourlyTaxesOrContributionsStore.getState();
    taxesModule.clear();
    taxesModule.add({ name: "Social Security", value: 11, description: null });
    taxesModule.add({ name: "Social Security", value: 8, description: null });
    taxesModule.add({ name: "Social Security", value: 8, description: null });
    expect(useHourlyTaxesOrContributionsStore.getState().taxesModule.salaryElement).toHaveLength(2);

    taxesModule.remove({ name: "Social Security", value: 11 });
    expect(
      useHourlyTaxesOrContributionsStore.getState().taxesModule.salaryElement.map((t) => t.value)
    ).toEqual([8]);
  });
});

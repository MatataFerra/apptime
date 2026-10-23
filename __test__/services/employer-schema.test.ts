import { describe, expect, test } from "vitest";

import { EmployerInputSchema, fieldErrors } from "@/services/Employer/schema";

describe("EmployerInputSchema", () => {
  test("only the name is required; empty optional fields become null", () => {
    const parsed = EmployerInputSchema.parse({
      name: "  Sunny Farms  ",
      taxId: "",
      city: "   ",
      defaultRate: null,
      defaultCurrency: "",
    });
    expect(parsed).toMatchObject({
      name: "Sunny Farms",
      taxId: null,
      city: null,
      contactEmail: null,
      defaultRate: null,
      defaultCurrency: null,
    });
  });

  test("keeps the details that are filled in", () => {
    const parsed = EmployerInputSchema.parse({
      name: "Sunny Farms",
      taxId: "51 824 753 556",
      postcode: "4670",
      contactEmail: "jobs@sunny.com.au",
      defaultRate: 31.5,
      defaultCurrency: "AUD",
    });
    expect(parsed).toMatchObject({
      taxId: "51 824 753 556",
      postcode: "4670",
      contactEmail: "jobs@sunny.com.au",
      defaultRate: 31.5,
      defaultCurrency: "AUD",
    });
  });

  test("reports each bad field once", () => {
    const result = EmployerInputSchema.safeParse({
      name: " ",
      contactEmail: "not-an-email",
      defaultRate: -1,
      defaultCurrency: "XYZ",
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(fieldErrors(result.error)).toEqual({
      name: "Add a name",
      contactEmail: "Check the email",
      defaultRate: "The rate can't be negative",
      defaultCurrency: "Pick a currency",
    });
  });

  test("rejects fields it doesn't know (owner, archived)", () => {
    expect(
      EmployerInputSchema.safeParse({ name: "Sunny Farms", userId: "someone-else" }).success
    ).toBe(false);
  });

  test("a register lookup is saved as which register and when", () => {
    const at = new Date(Date.now() - 60_000).toISOString();
    const parsed = EmployerInputSchema.parse({ name: "Kiwi", source: { registry: "nzbn", at } });
    expect(parsed).toMatchObject({ sourceRegistry: "nzbn", sourcedAt: new Date(at) });
    expect(parsed).not.toHaveProperty("source");

    // Left out (an edit without a new lookup): nothing to overwrite.
    expect(EmployerInputSchema.parse({ name: "Kiwi" })).not.toHaveProperty("sourceRegistry");
  });

  test("the source can't be made up: unknown register, future or old dates, extra keys", () => {
    const now = Date.now();
    const bad = [
      { registry: "acme", at: new Date(now).toISOString() },
      { registry: "nzbn", at: new Date(now + 60 * 60_000).toISOString() },
      { registry: "nzbn", at: new Date(now - 3 * 24 * 60 * 60_000).toISOString() },
      { registry: "nzbn", at: "yesterday" },
      { registry: "nzbn", at: new Date(now).toISOString(), text: "Data sourced from me" },
    ];
    for (const source of bad) {
      expect(EmployerInputSchema.safeParse({ name: "Kiwi", source }).success).toBe(false);
    }
  });
});

import { describe, expect, test } from "vitest";

import { currencyForCountry } from "@/services/Employer/currency";

describe("currencyForCountry", () => {
  test("countries the registers and the paste fill in", () => {
    expect(currencyForCountry("New Zealand")).toBe("NZD");
    expect(currencyForCountry("Australia")).toBe("AUD");
    expect(currencyForCountry("Germany")).toBe("EUR");
    expect(currencyForCountry(" deutschland ")).toBe("EUR");
    expect(currencyForCountry("España")).toBe("EUR");
    expect(currencyForCountry("Bulgaria")).toBe("EUR");
    expect(currencyForCountry("United Kingdom (Northern Ireland)")).toBe("GBP");
  });

  test("a currency the app doesn't have, or an unknown country: nothing", () => {
    expect(currencyForCountry("Poland")).toBeNull();
    expect(currencyForCountry("Argentina")).toBeNull();
    expect(currencyForCountry("Narnia")).toBeNull();
    expect(currencyForCountry(null)).toBeNull();
  });
});

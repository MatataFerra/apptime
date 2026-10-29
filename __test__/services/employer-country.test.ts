import { describe, expect, test } from "vitest";

import { canonicalCountry, countryForCurrency, suggestCountry } from "@/services/Employer/country";

describe("canonicalCountry", () => {
  test.each([
    ["New Zealand", "New Zealand"],
    ["  new zealand ", "New Zealand"],
    ["NZ", "New Zealand"],
    ["Aotearoa", "New Zealand"],
    ["Nueva Zelanda", "New Zealand"],
    ["Neuseeland", "New Zealand"],
    ["AUS", "Australia"],
    ["Deutschland", "Germany"],
    ["Alemania", "Germany"],
    ["España", "Spain"],
    ["Espana", "Spain"],
    ["UK", "United Kingdom"],
    ["U.S.A.", "United States"],
    ["Holland", "Netherlands"],
  ])("%s -> %s", (text, name) => {
    expect(canonicalCountry(text)).toBe(name);
  });

  test("not a country: null", () => {
    expect(canonicalCountry("New Zeland")).toBeNull();
    expect(canonicalCountry("Narnia")).toBeNull();
    expect(canonicalCountry("")).toBeNull();
    expect(canonicalCountry(null)).toBeNull();
  });
});

describe("suggestCountry", () => {
  test.each([
    ["New Zeland", "New Zealand"],
    ["new zeeland", "New Zealand"],
    ["Australa", "Australia"],
    ["Germnay", "Germany"],
    ["Nueva Zelandia", "New Zealand"],
  ])("%s -> %s", (text, name) => {
    expect(suggestCountry(text)).toBe(name);
  });

  test("nothing when it's far from every country, or too short to tell", () => {
    expect(suggestCountry("Narnia")).toBeNull();
    // One letter from Australia and from Austria: no guess.
    expect(suggestCountry("Austrlia")).toBeNull();
    expect(suggestCountry("Nz.")).toBe("New Zealand");
    expect(suggestCountry("Ab")).toBeNull();
  });
});

describe("countryForCurrency", () => {
  test("currencies of one country", () => {
    expect(countryForCurrency("AUD")).toBe("Australia");
    expect(countryForCurrency("NZD")).toBe("New Zealand");
    expect(countryForCurrency("GBP")).toBe("United Kingdom");
  });

  test("shared currencies or none: null", () => {
    expect(countryForCurrency("EUR")).toBeNull();
    expect(countryForCurrency("USD")).toBeNull();
    expect(countryForCurrency(null)).toBeNull();
  });
});

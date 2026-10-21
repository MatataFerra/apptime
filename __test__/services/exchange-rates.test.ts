import { describe, expect, test } from "vitest";

import {
  daysBetween,
  fillDays,
  makeConverter,
  parseRates,
  toTable,
} from "@/services/ExchangeRates/convert";

describe("parseRates", () => {
  test("reads the v2 list of rows (base EUR only)", () => {
    expect(
      parseRates([
        { date: "2026-10-21", base: "EUR", quote: "USD", rate: 1.1228 },
        { date: "2026-10-21", base: "EUR", quote: "gbp", rate: 0.84029 },
        { date: "2026-10-21", base: "USD", quote: "EUR", rate: 0.89 },
        { date: "bad", base: "EUR", quote: "AUD", rate: 1.6 },
        { date: "2026-10-21", base: "EUR", quote: "NZD", rate: -1 },
      ])
    ).toEqual([
      { date: "2026-10-21", quote: "USD", rate: 1.1228 },
      { date: "2026-10-21", quote: "GBP", rate: 0.84029 },
    ]);
  });

  test("reads the older per-date and single-date shapes", () => {
    expect(parseRates({ rates: { "2026-10-20": { USD: 1.12, AUD: 1.6 } } })).toEqual([
      { date: "2026-10-20", quote: "USD", rate: 1.12 },
      { date: "2026-10-20", quote: "AUD", rate: 1.6 },
    ]);
    expect(parseRates({ date: "2026-10-20", rates: { USD: 1.12 } })).toEqual([
      { date: "2026-10-20", quote: "USD", rate: 1.12 },
    ]);
    expect(parseRates(null)).toEqual([]);
  });
});

describe("fillDays", () => {
  // Fri 16, (Sat 17, Sun 18 not published), Mon 19.
  const published = [
    { date: "2026-10-16", quote: "USD", rate: 1.1 },
    { date: "2026-10-19", quote: "USD", rate: 1.2 },
  ];

  test("weekends repeat Friday's rate and are marked filled", () => {
    expect(fillDays(published, "2026-10-16", "2026-10-19", ["USD"])).toEqual([
      { date: "2026-10-16", quote: "USD", rate: 1.1, filled: false },
      { date: "2026-10-17", quote: "USD", rate: 1.1, filled: true },
      { date: "2026-10-18", quote: "USD", rate: 1.1, filled: true },
      { date: "2026-10-19", quote: "USD", rate: 1.2, filled: false },
    ]);
  });

  test("days before anything was published are left out", () => {
    expect(fillDays(published, "2026-10-14", "2026-10-16", ["USD", "GBP"])).toEqual([
      { date: "2026-10-16", quote: "USD", rate: 1.1, filled: false },
    ]);
  });

  test("daysBetween includes both ends and crosses months", () => {
    expect(daysBetween("2026-10-30", "2026-11-02")).toEqual([
      "2026-10-30",
      "2026-10-31",
      "2026-11-01",
      "2026-11-02",
    ]);
  });
});

describe("makeConverter", () => {
  const convert = makeConverter(
    toTable([
      { date: "2026-03-03", quote: "USD", rate: 1.05 },
      { date: "2026-03-03", quote: "GBP", rate: 0.84 },
      { date: "2026-10-21", quote: "USD", rate: 1.1228 },
    ])
  );

  test("uses the rate of the shift's own day", () => {
    // 105 USD on 3 March = 100 EUR, whatever the rate is later.
    expect(convert(105, "USD", "EUR", "2026-03-03")).toBeCloseTo(100);
    expect(convert(100, "EUR", "USD", "2026-10-21")).toBeCloseTo(112.28);
  });

  test("converts between two non-EUR currencies through EUR", () => {
    expect(convert(105, "USD", "GBP", "2026-03-03")).toBeCloseTo(84);
  });

  test("a day without a rate uses the closest earlier day, else the closest later", () => {
    expect(convert(105, "USD", "EUR", "2026-05-01")).toBeCloseTo(100); // from 3 March
    expect(convert(105, "USD", "EUR", "2026-01-01")).toBeCloseTo(100); // only later one
  });

  test("same currency is unchanged; unknown currency gives null", () => {
    expect(convert(42, "NZD", "NZD", "2026-03-03")).toBe(42);
    expect(convert(42, "NZD", "EUR", "2026-03-03")).toBeNull();
  });
});

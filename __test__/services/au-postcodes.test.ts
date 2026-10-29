import { describe, expect, test } from "vitest";

import {
  areasOfPostcode,
  checkPostcode,
  parseState,
  stateOfPostcode,
} from "@/services/Visa/australia";

describe("stateOfPostcode", () => {
  test.each([
    ["2000", "NSW"],
    ["2600", "ACT"],
    ["2618", "NSW"],
    ["2620", "NSW"],
    ["2905", "ACT"],
    ["0800", "NT"],
    ["3000", "VIC"],
    ["4670", "QLD"],
    ["5000", "SA"],
    ["6000", "WA"],
    ["7000", "TAS"],
  ])("%s -> %s", (postcode, state) => {
    expect(stateOfPostcode(postcode)).toBe(state);
  });

  test("not 4 digits, or unused: null", () => {
    expect(stateOfPostcode("467")).toBeNull();
    expect(stateOfPostcode("46700")).toBeNull();
    expect(stateOfPostcode("ABCD")).toBeNull();
    expect(stateOfPostcode("0100")).toBeNull();
  });
});

describe("areasOfPostcode", () => {
  test.each([
    ["2000", []], // Sydney
    ["4000", []], // Brisbane
    ["3000", []], // Melbourne
    ["6000", []], // Perth
    ["2600", []], // Canberra
    ["4670", ["regional"]], // Bundaberg
    ["4870", ["regional", "northern", "remote"]], // Cairns
    ["5000", ["regional"]], // Adelaide: all of SA
    ["5440", ["regional", "remote"]],
    ["7000", ["regional"]], // Hobart: all of TAS
    ["0870", ["regional", "northern", "remote"]], // Alice Springs
    ["0872", ["regional", "northern", "remote"]],
    ["6725", ["regional", "northern"]], // Broome
    ["2880", ["regional"]], // Broken Hill
    ["2899", ["regional", "remote"]], // Norfolk Island
  ])("%s -> %j", (postcode, areas) => {
    expect(areasOfPostcode(postcode)).toEqual(areas);
  });
});

describe("parseState", () => {
  test("codes and names", () => {
    expect(parseState("Qld.")).toBe("QLD");
    expect(parseState("western australia")).toBe("WA");
    expect(parseState("Bayern")).toBeNull();
  });
});

describe("checkPostcode", () => {
  test("ok, with the state and areas", () => {
    expect(checkPostcode("4670", "QLD")).toEqual({
      kind: "ok",
      state: "QLD",
      areas: ["regional"],
    });
  });

  test("a postcode from another state than the one typed", () => {
    expect(checkPostcode("4670", "VIC")).toMatchObject({
      kind: "state_mismatch",
      state: "QLD",
      typed: "VIC",
    });
  });

  test("0872 is fine with NT or WA", () => {
    expect(checkPostcode("0872", "WA").kind).toBe("ok");
    expect(checkPostcode("0872", "NT").kind).toBe("ok");
  });

  test("empty and invalid", () => {
    expect(checkPostcode("", "QLD").kind).toBe("empty");
    expect(checkPostcode("467", "QLD").kind).toBe("invalid");
  });
});

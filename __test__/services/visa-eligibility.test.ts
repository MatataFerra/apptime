import { describe, expect, test } from "vitest";

import { eligibility, workPostcodeOf } from "@/services/VisaReport/eligibility";

function employer(
  visaWorkType: string | null,
  postcode: string | null = null,
  workPostcode = null
) {
  return { visaWorkType, postcode, workPostcode };
}

describe("eligibility: Australia", () => {
  test.each([
    // [type, postcode, subclass, status]
    ["plant_animal_cultivation", "4670", "417", "eligible"], // Bundaberg
    ["plant_animal_cultivation", "4000", "417", "not_eligible"], // Brisbane
    ["plant_animal_cultivation", "5000", "462", "eligible"], // Adelaide: all of SA
    ["construction", "2880", "462", "eligible"], // Broken Hill, regional
    ["fishing_pearling", "4670", "417", "eligible"],
    ["fishing_pearling", "4670", "462", "not_eligible"], // 462: northern only
    ["fishing_pearling", "4870", "462", "eligible"], // Cairns
    ["tree_farming_felling", "6725", "462", "eligible"], // Broome
    ["mining", "6430", "417", "eligible"], // Kalgoorlie
    ["mining", "6430", "462", "not_eligible"],
    ["tourism_hospitality", "4670", "417", "not_eligible"], // regional isn't enough
    ["tourism_hospitality", "4870", "417", "eligible"],
    ["tourism_hospitality", "0870", "462", "eligible"], // Alice Springs
  ] as const)("%s at %s on a %s: %s", (type, postcode, subclass, status) => {
    expect(eligibility(employer(type, postcode), "AU", subclass).status).toBe(status);
  });

  test("reasons", () => {
    expect(eligibility(employer(null, "4670"), "AU")).toEqual({
      status: "unknown",
      reason: "no_work_type",
    });
    expect(eligibility(employer("mining"), "AU")).toEqual({
      status: "unknown",
      reason: "no_postcode",
    });
    expect(eligibility(employer("recovery", "4670"), "AU")).toEqual({
      status: "unknown",
      reason: "recovery",
    });
    expect(eligibility(employer("other", "4670"), "AU")).toEqual({
      status: "not_eligible",
      reason: "work_type",
    });
    expect(eligibility(employer("mining", "4000"), "AU")).toEqual({
      status: "not_eligible",
      reason: "area",
    });
    // A New Zealand kind of work on an Australian visa: not set for it.
    expect(eligibility(employer("viticulture", "4670"), "AU").status).toBe("unknown");
  });
});

describe("eligibility: New Zealand", () => {
  test("only horticulture and viticulture, anywhere", () => {
    expect(eligibility(employer("horticulture"), "NZ").status).toBe("eligible");
    expect(eligibility(employer("viticulture"), "NZ").status).toBe("eligible");
    expect(eligibility(employer("other"), "NZ").status).toBe("not_eligible");
    expect(eligibility(employer(null), "NZ").status).toBe("unknown");
  });
});

describe("workPostcodeOf", () => {
  test("the work postcode, else the address one", () => {
    expect(workPostcodeOf({ postcode: "4000", workPostcode: "4670" })).toBe("4670");
    expect(workPostcodeOf({ postcode: "4000", workPostcode: " " })).toBe("4000");
    expect(workPostcodeOf({ postcode: null, workPostcode: null })).toBeNull();
  });
});

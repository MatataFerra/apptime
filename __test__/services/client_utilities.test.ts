import { describe, expect, test } from "vitest";

import ut from "@/services/Utilities/client";

describe("Client Utilities", () => {
  test("isTrutyValue", () => {
    const isTruthy = ut.isTruthyValue([1, 2]);
    expect(isTruthy).toBeTruthy();
  });

  test("isFalsyValue", () => {
    const isFalsy = ut.isFalsyValue(false);
    expect(isFalsy).toBeTruthy();
  });
});

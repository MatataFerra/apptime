/* eslint-disable no-console */
import { describe, expect, test } from "vitest";

import ut from "@/services/Utilities/client";

describe("services/env", () => {
  test("should work", async () => {
    const env = process.env.TEST_BOOLEAN_TO_BE_TRUE;

    console.log("TEST_BOOLEAN_TO_BE_TRUE", env);

    expect(env).toBeTruthy();
  });

  test("should convert env variable to boolean to false", async () => {
    const env_falsy = process.env.TEST_BOOLEAN_TO_BE_FALSE!;
    const falsy = ut.toBool(env_falsy);

    expect(falsy).toBeFalsy();
  });

  test("should convert env variable to boolean to true", async () => {
    const env_truthy = process.env.TEST_BOOLEAN_TO_BE_TRUE!;
    const truthy = ut.toBool(env_truthy);

    expect(truthy).toBeTruthy();
  });
});

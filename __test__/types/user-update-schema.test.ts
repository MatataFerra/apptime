import { describe, expect, test } from "vitest";

import { UserModelSchema, UserUpdateSchema } from "@/types";

describe("UserUpdateSchema", () => {
  test("keeps only the fields sent: no defaults for the ones left out", () => {
    expect(UserUpdateSchema.parse({ name: "Ana" })).toEqual({ name: "Ana" });
    expect(UserUpdateSchema.parse({ image: null, online: true })).toEqual({
      image: null,
      online: true,
    });
  });

  test("still rejects making someone an admin or changing the email", () => {
    expect(UserUpdateSchema.safeParse({ role: "ADMIN" }).success).toBe(false);
    expect(UserUpdateSchema.safeParse({ email: "x@y.com" }).success).toBe(false);
  });

  test("covers the same fields as the user model", () => {
    expect(Object.keys(UserUpdateSchema.shape ?? {}).sort()).toEqual(
      Object.keys(UserModelSchema.shape).sort()
    );
  });
});

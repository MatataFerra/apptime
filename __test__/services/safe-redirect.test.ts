import { describe, expect, test } from "vitest";

import { safeRedirectPath } from "@/utils/helpers/safeRedirect";

describe("safeRedirectPath", () => {
  test.each([
    ["/dashboard", "/dashboard"],
    ["/es/track?tab=1#top", "/es/track?tab=1#top"],
  ])("keeps a path on this site: %s", (redirect, expected) => {
    expect(safeRedirectPath(redirect, "/")).toBe(expected);
  });

  test.each([
    null,
    "",
    "dashboard",
    "//evil.com",
    "/\\evil.com",
    "/\t/evil.com",
    "/\n/evil.com",
    "https://evil.com",
    "javascript:alert(1)",
  ])("falls back for anything that could leave the site: %j", (redirect) => {
    expect(safeRedirectPath(redirect, "/")).toBe("/");
  });
});

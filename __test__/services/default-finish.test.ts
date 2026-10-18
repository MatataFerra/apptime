import { describe, expect, test } from "vitest";

import { defaultFinish, needsDefaultFinish } from "@/utils/helpers/defaultFinish";

describe("defaultFinish", () => {
  test("same day, 8 hours later", () => {
    expect(defaultFinish("2026-10-15T08:00")).toBe("2026-10-15T16:00");
  });

  test("never crosses midnight", () => {
    expect(defaultFinish("2026-10-15T20:00")).toBe("2026-10-15T23:59");
  });

  test("only replaces a missing, earlier or other-day finish", () => {
    expect(needsDefaultFinish("2026-10-15T08:00", "")).toBe(true);
    expect(needsDefaultFinish("2026-10-15T08:00", "2026-10-14T10:00")).toBe(true);
    expect(needsDefaultFinish("2026-10-15T08:00", "2026-10-20T10:00")).toBe(true);
    expect(needsDefaultFinish("2026-10-15T08:00", "2026-10-15T17:30")).toBe(false);
  });
});

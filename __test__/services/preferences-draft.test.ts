import { beforeEach, describe, expect, test } from "vitest";

import { usePreferencesDraft } from "@/store/usePreferencesDraft";

const saved = { holidayRate: 1.5, earningsGoal: null, goalPeriod: "week" };

beforeEach(() => usePreferencesDraft.getState().clear());

describe("preferences draft", () => {
  test("keeps only what differs from what's saved", () => {
    const { stage } = usePreferencesDraft.getState();
    stage({ holidayRate: 2, goalPeriod: "week" }, saved);
    expect(usePreferencesDraft.getState().draft).toEqual({ holidayRate: 2 });

    stage({ earningsGoal: 500 }, saved);
    stage({ holidayRate: 1.5 }, saved);
    expect(usePreferencesDraft.getState().draft).toEqual({ earningsGoal: 500 });

    // Emptied back to "no goal" (null), the same as saved.
    stage({ earningsGoal: null }, saved);
    expect(usePreferencesDraft.getState().draft).toEqual({});
  });
});

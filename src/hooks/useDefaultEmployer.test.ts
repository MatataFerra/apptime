import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  config: { defaultEmployerId: 7 as number | null },
  employers: [
    { id: 7, name: "Orchard", archived: false, defaultRate: 28 },
    { id: 8, name: "Old farm", archived: true, defaultRate: 20 },
  ],
  loading: false,
}));

vi.mock("@/hooks/useUser", () => ({ default: () => ({ data: { config: mocks.config } }) }));
vi.mock("@/hooks/useEmployers", () => ({
  default: () => ({
    employers: mocks.employers.filter((e) => !e.archived),
    byId: new Map(mocks.employers.map((e) => [e.id, e])),
    isLoading: mocks.loading,
  }),
}));

import useDefaultEmployer from "@/hooks/useDefaultEmployer";

beforeEach(() => {
  mocks.config = { defaultEmployerId: 7 };
  mocks.loading = false;
});

describe("useDefaultEmployer", () => {
  test("picks the default employer once when none is chosen", () => {
    const apply = vi.fn();
    const { rerender } = renderHook(({ current }) => useDefaultEmployer(current, apply), {
      initialProps: { current: null as number | null },
    });
    expect(apply).toHaveBeenCalledTimes(1);
    expect(apply.mock.calls[0][0]).toMatchObject({ id: 7, defaultRate: 28 });

    // Choosing "None" afterwards is respected.
    rerender({ current: null });
    expect(apply).toHaveBeenCalledTimes(1);
  });

  test("leaves an employer already chosen (e.g. repeating a shift)", () => {
    const apply = vi.fn();
    renderHook(() => useDefaultEmployer(3, apply));
    expect(apply).not.toHaveBeenCalled();
  });

  test("skips an archived default, or none set", () => {
    const apply = vi.fn();
    mocks.config = { defaultEmployerId: 8 };
    renderHook(() => useDefaultEmployer(null, apply));
    mocks.config = { defaultEmployerId: null };
    renderHook(() => useDefaultEmployer(null, apply));
    expect(apply).not.toHaveBeenCalled();
  });

  test("waits for the employers to load", () => {
    const apply = vi.fn();
    mocks.loading = true;
    const { rerender } = renderHook(() => useDefaultEmployer(null, apply));
    expect(apply).not.toHaveBeenCalled();
    mocks.loading = false;
    rerender();
    expect(apply).toHaveBeenCalledTimes(1);
  });
});

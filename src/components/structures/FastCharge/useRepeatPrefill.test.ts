import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { HourlyType } from "@/types";

const replace = vi.fn();
let search = "repeat=42";

vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(search) }));
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ replace }) }));

import useRepeatPrefill from "@/components/structures/FastCharge/useRepeatPrefill";

const shift = {
  id: 42,
  startDate: new Date(2026, 9, 23, 7, 0).toString(),
  endDate: new Date(2026, 9, 23, 17, 45).toString(),
} as HourlyType;

describe("useRepeatPrefill", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 25, 8, 30));
    replace.mockClear();
    search = "repeat=42";
  });

  test("fills the shift moved to today once the shifts load, then drops the param", () => {
    const apply = vi.fn();
    const { rerender } = renderHook(({ hourly }) => useRepeatPrefill(hourly, apply), {
      initialProps: { hourly: undefined as HourlyType[] | undefined },
    });
    expect(apply).not.toHaveBeenCalled();

    rerender({ hourly: [shift] });
    expect(apply).toHaveBeenCalledWith(
      shift,
      new Date(2026, 9, 25, 7, 0),
      new Date(2026, 9, 25, 17, 45)
    );
    expect(replace).toHaveBeenCalledWith("/fast-charge", { scroll: false });

    rerender({ hourly: [shift, { ...shift, id: 43 }] });
    expect(apply).toHaveBeenCalledTimes(1);
  });

  test("does nothing without the param", () => {
    search = "";
    const apply = vi.fn();
    renderHook(() => useRepeatPrefill([shift], apply));
    expect(apply).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });
});

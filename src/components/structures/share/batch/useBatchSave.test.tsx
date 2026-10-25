import type { ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const toast = vi.hoisted(() => vi.fn());
vi.mock("@/services/Toast", () => ({ default: toast }));

import useBatchSave from "@/components/structures/share/batch/useBatchSave";

import { IntlWrapper } from "#/__test__/utils/intl";

function setup() {
  const client = new QueryClient();
  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <IntlWrapper>{children}</IntlWrapper>
      </QueryClientProvider>
    );
  }
  return renderHook(() => useBatchSave("production"), { wrapper });
}

describe("useBatchSave", () => {
  beforeEach(() => toast.mockClear());

  test("keeps a toast up while saving, then says how many were saved", async () => {
    const { result } = setup();
    let finish!: (value: { created: number; skipped: unknown[] }) => void;
    const onSaved = vi.fn();

    let run!: Promise<void>;
    act(() => {
      run = result.current.run(9, () => new Promise((r) => (finish = r)), onSaved);
    });
    expect(result.current.saving).toBe(true);
    expect(toast).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: "loading", message: "Saving 9 shifts…", duration: Infinity })
    );

    await act(async () => {
      finish({ created: 9, skipped: [] });
      await run;
    });
    expect(result.current.saving).toBe(false);
    expect(toast).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: "success", message: "9 shifts saved" })
    );
    expect(onSaved).toHaveBeenCalled();
  });

  test("a request that throws ends in an error, not a stuck button", async () => {
    const { result } = setup();
    const onSaved = vi.fn();

    await act(() => result.current.run(9, () => Promise.reject(new Error("timeout")), onSaved));

    expect(result.current.saving).toBe(false);
    expect(toast).toHaveBeenLastCalledWith(expect.objectContaining({ type: "error" }));
    expect(onSaved).not.toHaveBeenCalled();
  });
});

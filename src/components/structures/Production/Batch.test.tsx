import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ save: vi.fn() }));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));
vi.mock("@/services/Toast", () => ({ default: vi.fn() }));
vi.mock("@/server-actions/production-batch", () => ({ default: mocks.save }));
vi.mock("@/hooks/useHourlyShifts", () => ({ default: () => ({ data: [] }) }));
vi.mock("@/hooks/useProductionShifts", () => ({ default: () => ({ data: [] }) }));
vi.mock("@/hooks/useUser", () => ({ default: () => ({ data: { config: {} } }) }));
vi.mock("@/hooks/useEmployers", () => ({
  default: () => ({ employers: [], byId: new Map(), isLoading: false }),
}));
vi.mock("@/hooks/useShiftNames", () => ({ default: () => ({ names: [] }) }));
vi.mock("@/hooks/useMoney", () => ({
  default: () => (value: number) => `$${value.toFixed(2)}`,
  useCurrency: () => "AUD",
}));
vi.mock("@/components/modules/Production/Drawer", () => ({ default: () => null }));
vi.mock("@/components/structures/ShiftForms/EmployerSelect", () => ({ default: () => null }));
vi.mock("@/components/structures/ShiftForms/CurrencySelect", () => ({ default: () => null }));
vi.mock("@/components/structures/ShiftForms/Datalist", () => ({ default: () => null }));

import Batch from "@/components/structures/Production/Batch";

import { renderWithIntl } from "#/__test__/utils/intl";

beforeEach(() => {
  mocks.save.mockReset();
  mocks.save.mockResolvedValue({ created: 3, skipped: [] });
});

describe("Production, several days", () => {
  test("the default quantity fills every day and each day can be changed", async () => {
    const user = userEvent.setup();
    renderWithIntl(<Batch />);

    fireEvent.change(screen.getByLabelText("First shift starts"), {
      target: { value: "2026-10-05T07:00" },
    });
    fireEvent.change(screen.getByLabelText("Repeat until"), { target: { value: "2026-10-07" } });
    await user.type(screen.getByLabelText(/^Value per item/), "38");

    // No quantity yet: every day is flagged and saving is blocked.
    expect(screen.getByText(/3 days have no quantity/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Review 3 shifts" })).toBeDisabled();

    await user.type(screen.getByLabelText("Quantity per day"), "4");
    const tuesday = screen.getByLabelText("Quantity, Tuesday 6 October");
    expect(tuesday).toHaveValue(4);
    await user.clear(tuesday);
    await user.type(tuesday, "6.5");

    // 4 + 6.5 + 4 bins at $38.
    expect(screen.getByText("14.5 items · $551.00")).toBeInTheDocument();

    // Unticking a day leaves its quantity out of the totals.
    const list = screen.getByRole("list");
    await user.click(within(list).getAllByRole("checkbox")[2]);
    expect(screen.getByText("10.5 items · $399.00")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Review 2 shifts" }));
    await user.click(await screen.findByRole("button", { name: "Save 2 shifts" }));

    const sent = mocks.save.mock.calls[0][0];
    expect(sent.itemValue).toBe(38);
    expect(sent.shifts.map((s: { itemQuantity: number }) => s.itemQuantity)).toEqual([4, 6.5]);
  });
});

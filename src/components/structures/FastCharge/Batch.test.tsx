import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  hourly: [] as { startDate: string; endDate: string | null }[],
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));
vi.mock("@/services/Toast", () => ({ default: vi.fn() }));
vi.mock("@/server-actions/hourly-batch", () => ({ default: mocks.save }));
vi.mock("@/hooks/useUser", () => ({
  default: () => ({ data: { config: { hourValue: 30, unpaidBreaks: 30 } } }),
}));
vi.mock("@/hooks/useHourlyShifts", () => ({ default: () => ({ data: mocks.hourly }) }));
vi.mock("@/hooks/useProductionShifts", () => ({ default: () => ({ data: [] }) }));
vi.mock("@/hooks/useShiftNames", () => ({ default: () => ({ names: [] }) }));
vi.mock("@/hooks/useMoney", () => ({
  default: () => (value: number) => `$${value.toFixed(2)}`,
  useCurrency: () => "AUD",
}));
vi.mock("@/components/modules/FastCharge/Drawer", () => ({ default: () => null }));
vi.mock("@/components/structures/ShiftForms/EmployerSelect", () => ({ default: () => null }));
vi.mock("@/components/structures/ShiftForms/CurrencySelect", () => ({ default: () => null }));
vi.mock("@/components/structures/ShiftForms/Datalist", () => ({ default: () => null }));

import Batch from "@/components/structures/FastCharge/Batch";

import { renderWithIntl } from "#/__test__/utils/intl";

beforeEach(() => {
  mocks.save.mockReset();
  mocks.save.mockResolvedValue({ created: 3, skipped: [] });
  // Wednesday 7 Oct is already logged.
  mocks.hourly = [
    {
      startDate: new Date(2026, 9, 7, 9).toString(),
      endDate: new Date(2026, 9, 7, 13).toString(),
    },
  ];
});

describe("Fast charge, several days", () => {
  test("repeats the first shift Mon–Fri, skips a logged day and saves what's ticked", async () => {
    const user = userEvent.setup();
    renderWithIntl(<Batch />);

    // The rate saved in Settings is there to start with.
    expect((screen.getByLabelText("Hourly rate") as HTMLInputElement).value).toBe("30");

    // datetime-local can't be typed into in jsdom: set it like a picker does.
    fireEvent.change(screen.getByLabelText("First shift starts"), {
      target: { value: "2026-10-05T08:00" },
    });

    // Finish suggested 8h later; "until" a week ahead.
    expect((screen.getByLabelText("First shift finishes") as HTMLInputElement).value).toBe(
      "2026-10-05T16:00"
    );
    expect((screen.getByLabelText("Repeat until") as HTMLInputElement).value).toBe("2026-10-11");

    const list = screen.getByRole("list");
    expect(within(list).getAllByRole("checkbox")).toHaveLength(5);
    expect(screen.getByText("4 of 5 shifts")).toBeInTheDocument();
    expect(within(list).getByText("Already logged")).toBeInTheDocument();

    // Leave Thursday out.
    const boxes = within(list).getAllByRole("checkbox");
    await user.click(boxes[3]);
    expect(screen.getByText("3 of 5 shifts")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Review 3 shifts" }));
    await user.click(await screen.findByRole("button", { name: "Save 3 shifts" }));

    expect(mocks.save).toHaveBeenCalledTimes(1);
    const sent = mocks.save.mock.calls[0][0];
    expect(sent).toMatchObject({ hourValue: 30, unpaidBreaks: 30, employerId: null });
    expect(sent.shifts.map((s: { startDate: string }) => new Date(s.startDate).getDate())).toEqual([
      5, 6, 9,
    ]);
  });

  test("Saturdays only, and a finish before the start is flagged", async () => {
    const user = userEvent.setup();
    renderWithIntl(<Batch />);

    fireEvent.change(screen.getByLabelText("First shift starts"), {
      target: { value: "2026-10-05T08:00" },
    });
    for (const day of ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]) {
      await user.click(screen.getByRole("button", { name: day }));
    }
    expect(screen.getByRole("button", { name: "Saturday" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByText("1 of 1 shifts")).toBeInTheDocument(); // Saturday 10 only

    fireEvent.change(screen.getByLabelText("First shift finishes"), {
      target: { value: "2026-10-05T07:00" },
    });
    expect(screen.getByText("The finish must be after the start")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  test("a day can have its own hours, e.g. a shorter Saturday", async () => {
    const user = userEvent.setup();
    renderWithIntl(<Batch />);

    fireEvent.change(screen.getByLabelText("First shift starts"), {
      target: { value: "2026-10-05T08:00" },
    });
    await user.click(screen.getByRole("button", { name: "Saturday" }));
    // Wednesday 7 is already logged: Mon, Tue, Thu, Fri and Sat 10 are left.
    expect(screen.getByText("5 of 6 shifts")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Change hours, Saturday 10/ }));
    fireEvent.change(screen.getByLabelText("Finishes"), { target: { value: "12:00" } });
    await user.click(screen.getByRole("button", { name: "Done" }));

    await user.click(screen.getByRole("button", { name: "Review 5 shifts" }));
    expect(await screen.findByText("1 day with its own hours")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Save 5 shifts" }));

    const sent = mocks.save.mock.calls[0][0].shifts as { startDate: string; endDate: string }[];
    expect(sent.at(-1)).toEqual({
      startDate: new Date(2026, 9, 10, 8, 0).toString(),
      endDate: new Date(2026, 9, 10, 12, 0).toString(),
    });
    // The rest keep the first shift's hours.
    expect(sent[0].endDate).toBe(new Date(2026, 9, 5, 16, 0).toString());
  });
});

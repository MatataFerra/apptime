import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { HourlyType, ProductionType } from "@/types";

const mocks = vi.hoisted(() => ({
  edit: vi.fn(),
  remove: vi.fn(),
  hourly: [] as unknown[],
  production: [] as unknown[],
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/services/Toast", () => ({ default: vi.fn() }));
vi.mock("@/server-actions/edit-shifts-batch", () => ({ default: mocks.edit }));
vi.mock("@/server-actions/delete-shifts-batch", () => ({ default: mocks.remove }));
vi.mock("@/hooks/useHourlyShifts", () => ({
  default: () => ({ data: mocks.hourly, isLoading: false }),
}));
vi.mock("@/hooks/useProductionShifts", () => ({
  default: () => ({ data: mocks.production, isLoading: false }),
}));
vi.mock("@/hooks/useDashboard", () => ({ default: () => ({ isDateFiltered: false }) }));
vi.mock("@/hooks/useEmployers", () => {
  const all = [
    { id: 1, name: "Berry Farm", archived: false },
    { id: 2, name: "Kiwi Packhouse", archived: false },
  ];
  return {
    default: () => ({ employers: all, byId: new Map(all.map((e) => [e.id, e])), isLoading: false }),
  };
});
vi.mock("@/hooks/useMoney", () => ({
  default: () => (value: number) => `$${value.toFixed(2)}`,
  useCurrency: () => "AUD",
}));
vi.mock("@/components/structures/Dashboard/Table/Dialog/Dialog", () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock("@/components/structures/Dashboard/Table/Dialog/Content", () => ({ default: () => null }));
// vaul needs layout APIs jsdom lacks: a plain container is enough here.
vi.mock("@/components/ui/Drawer", () => {
  function Pass({ children }: { children?: React.ReactNode }) {
    return <div>{children}</div>;
  }
  return {
    Drawer: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
      open ? <div role="dialog">{children}</div> : null,
    DrawerContent: Pass,
    DrawerHeader: Pass,
    DrawerFooter: Pass,
    DrawerTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
    DrawerDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  };
});

import ShiftHistory from "@/components/structures/Dashboard/History/ShiftHistory";

import { useDashHourlyStore } from "@/store/useDashHourlyStore";
import { useDashProductionStore } from "@/store/useDashProductionStore";
import { useHistorySelection } from "@/store/useHistorySelection";
import { renderWithIntl } from "#/__test__/utils/intl";

function hourly(id: number, day: number, employerId: number | null): HourlyType {
  const start = new Date(2026, 9, day, 8);
  return {
    id,
    name: "Picking",
    startDate: start.toString(),
    endDate: new Date(start.valueOf() + 8 * 3600e3).toString(),
    amount: 480,
    isPublicHoliday: false,
    publicHolidayWorked: false,
    isClosed: true,
    notes: null,
    hourValue: 24,
    unpaidBreaks: 0,
    shiftId: 1,
    currency: null,
    source: null,
    employerId,
    taxes: [],
  } as unknown as HourlyType;
}

function production(id: number, day: number, employerId: number | null): ProductionType {
  const start = new Date(2026, 9, day, 8);
  return {
    id,
    name: "Packing",
    startDate: start.toString(),
    endDate: new Date(start.valueOf() + 3600e3).toString(),
    amount: 60,
    isPublicHoliday: false,
    publicHolidayWorked: false,
    isClosed: true,
    notes: null,
    itemValue: 0.5,
    itemQuantity: 100,
    shiftId: 1,
    currency: null,
    employerId,
    taxes: [],
  } as unknown as ProductionType;
}

async function pickEmployer(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByTestId("history-employer-filter"));
  await user.click(
    within(screen.getByRole("listbox")).getByRole("option", { name: new RegExp(name) })
  );
}

function renderHistory() {
  return renderWithIntl(
    <QueryClientProvider client={new QueryClient()}>
      <ShiftHistory />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  mocks.edit.mockReset().mockResolvedValue({ hourly: 1, production: 1 });
  mocks.remove.mockReset().mockResolvedValue({ hourly: 1, production: 0 });
  mocks.hourly = [hourly(1, 20, 1), hourly(2, 16, 2), hourly(3, 14, null)];
  mocks.production = [production(1, 17, 1)];
  useDashHourlyStore.setState({ hourly: null, initialHourlies: null });
  useDashProductionStore.setState({ productions: null, initialProductions: null });
  useHistorySelection.getState().stop();
});

describe("Dashboard history", () => {
  test("filters by employer and names it on each row", async () => {
    const user = userEvent.setup();
    renderHistory();

    expect(screen.getAllByTestId("history-row")).toHaveLength(4);
    expect(screen.getAllByText(/Berry Farm ·/)).toHaveLength(2);

    await pickEmployer(user, "Berry Farm");
    expect(screen.getAllByTestId("history-row")).toHaveLength(2);

    await pickEmployer(user, "No employer");
    expect(screen.getAllByTestId("history-row")).toHaveLength(1);
  });

  test("selects a month, edits the selection and leaves selection mode", async () => {
    const user = userEvent.setup();
    renderHistory();
    // Filter first: only what's on screen can be selected.
    await pickEmployer(user, "Berry Farm");
    act(() => useHistorySelection.getState().start());
    await user.click(screen.getByRole("checkbox", { name: /Select October 2026/ }));
    expect(screen.getByText("2 selected")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Edit 2" }));
    const drawer = screen.getByRole("dialog");
    await user.selectOptions(within(drawer).getByLabelText("Employer"), "Kiwi Packhouse");
    await user.type(within(drawer).getByLabelText(/Hourly rate/), "26");
    await user.click(within(drawer).getByRole("button", { name: "Save 2 shifts" }));

    expect(mocks.edit).toHaveBeenCalledWith({
      ids: { hourly: [1], production: [1] },
      changes: { employerId: 2, hourValue: 26 },
    });
    await vi.waitFor(() => expect(useHistorySelection.getState().active).toBe(false));
  });

  test("an untouched form saves nothing", async () => {
    const user = userEvent.setup();
    renderHistory();
    act(() => useHistorySelection.getState().start());

    await user.click(screen.getAllByTestId("history-row")[0]);
    await user.click(screen.getByRole("button", { name: "Edit 1" }));
    await user.click(screen.getByRole("button", { name: "Save 1 shift" }));

    expect(screen.getByRole("alert")).toHaveTextContent("You didn't change anything.");
    expect(mocks.edit).not.toHaveBeenCalled();
  });

  test("deletes after confirming", async () => {
    const user = userEvent.setup();
    renderHistory();
    act(() => useHistorySelection.getState().start());

    await user.click(screen.getAllByTestId("history-row")[0]);
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(mocks.remove).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Delete 1" }));
    expect(mocks.remove).toHaveBeenCalledWith({ ids: { hourly: [1], production: [] } });
  });
});

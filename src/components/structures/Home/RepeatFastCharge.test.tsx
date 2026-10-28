import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { HourlyType } from "@/types";

const push = vi.fn();
const create = vi.fn(async (_data: unknown) => ({ response: true }));

const friday: HourlyType = {
  id: 42,
  name: "Cellar Hand",
  startDate: new Date(2026, 9, 23, 7, 0).toString(),
  endDate: new Date(2026, 9, 23, 17, 45).toString(),
  amount: 645,
  isPublicHoliday: false,
  publicHolidayWorked: false,
  isClosed: true,
  notes: null,
  hourValue: 14.9,
  unpaidBreaks: 30,
  shiftId: 1,
  currency: "EUR",
  employerId: 7,
  source: "fast",
  taxes: [],
  contributions: [{ name: "Pension", value: 3, description: null }],
} as unknown as HourlyType;

vi.mock("@/hooks/useHourlyShifts", () => ({ default: () => ({ data: [friday] }) }));
vi.mock("@/hooks/useUser", () => ({ default: () => ({ data: { config: {} } }) }));
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/server-actions/hourly-job", () => ({ default: (data: unknown) => create(data) }));
vi.mock("@/services/Toast", () => ({ default: vi.fn() }));

import RepeatFastCharge from "@/components/structures/Home/RepeatFastCharge";

import { renderWithIntl } from "#/__test__/utils/intl";

function setup() {
  const user = userEvent.setup();
  renderWithIntl(
    <QueryClientProvider client={new QueryClient()}>
      <RepeatFastCharge />
    </QueryClientProvider>
  );
  return { user };
}

describe("RepeatFastCharge", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 24, 8, 30));
    push.mockClear();
    create.mockClear();
  });

  test("Edit opens Fast charge with that shift instead of just closing", async () => {
    const { user } = setup();

    await user.click(screen.getByRole("button", { name: /log it for today/i }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Edit" }));

    expect(push).toHaveBeenCalledWith("/fast-charge?repeat=42");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(create).not.toHaveBeenCalled();
  });

  test("saving keeps the employer and the contributions", async () => {
    const { user } = setup();

    await user.click(screen.getByRole("button", { name: /log it for today/i }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: /save/i }));

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        employerId: 7,
        currency: "EUR",
        contributions: [{ name: "Pension", value: 3, description: null }],
      })
    );
  });
});

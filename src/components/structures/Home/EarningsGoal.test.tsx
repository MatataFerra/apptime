import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  config: { earningsGoal: 800 as number | null, goalPeriod: "week", weekStartsOn: "monday" },
  hourly: [] as unknown[],
}));

vi.mock("@/hooks/useUser", () => ({ default: () => ({ data: { config: mocks.config } }) }));
vi.mock("@/hooks/useShiftsInCurrency", () => ({
  default: () => ({ hourly: mocks.hourly, production: [], currency: "USD" }),
}));

import EarningsGoal from "@/components/structures/Home/EarningsGoal";

import { renderWithIntl } from "#/__test__/utils/intl";

function shift(day: number, hours: number) {
  return {
    startDate: new Date(2026, 9, day, 8).toString(),
    endDate: new Date(2026, 9, day, 8 + hours).toString(),
    hourValue: 25,
    unpaidBreaks: 0,
    isClosed: true,
    isPublicHoliday: false,
    publicHolidayWorked: false,
  };
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 9, 28, 18, 0)); // Wednesday
  mocks.config = { earningsGoal: 800, goalPeriod: "week", weekStartsOn: "monday" };
  // Mon 26 and Tue 27, 8h × $25 = $400 this week; Fri 23 was last week.
  mocks.hourly = [shift(23, 8), shift(26, 8), shift(27, 8)];
});

describe("EarningsGoal", () => {
  test("this week against the goal, and what's left", () => {
    renderWithIntl(<EarningsGoal />);
    expect(screen.getByText("Weekly goal")).toBeInTheDocument();
    expect(screen.getByText("$400 of $800")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
    expect(screen.getByText("$400 to go · 4 days left")).toBeInTheDocument();
  });

  test("a monthly goal counts the whole month", () => {
    mocks.config = { earningsGoal: 500, goalPeriod: "month", weekStartsOn: "monday" };
    renderWithIntl(<EarningsGoal />);
    expect(screen.getByText("Goal for October")).toBeInTheDocument();
    expect(screen.getByText("Goal reached. Nice work!")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });

  test("nothing without a goal", () => {
    mocks.config = { earningsGoal: null, goalPeriod: "week", weekStartsOn: "monday" };
    renderWithIntl(<EarningsGoal />);
    expect(screen.queryByTestId("earnings-goal")).toBeNull();
  });
});

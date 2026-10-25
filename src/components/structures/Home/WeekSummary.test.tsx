import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

function job(day: number, name: string, from: number, to: number, earned: number) {
  return {
    kind: "hourly" as const,
    name,
    start: new Date(2026, 9, day, from),
    end: new Date(2026, 9, day, to),
    earned,
    publicHoliday: false,
  };
}

// Thursday 22: Box Maker in the morning, Web Developer at night.
const shifts = [
  [job(19, "Box Maker", 7, 15, 186)],
  [job(20, "Box Maker", 7, 16, 210)],
  [],
  [job(22, "Box Maker", 7, 12, 120), job(22, "Web Developer", 18, 22, 95)],
  [{ ...job(23, "Box Maker", 7, 16, 240), publicHoliday: true }],
  [],
  [],
];
const days = shifts.map((list, i) => ({
  date: new Date(2026, 9, 19 + i),
  hourly: list.reduce((sum, s) => sum + s.earned, 0),
  production: 0,
  publicHoliday: list.some((s) => s.publicHoliday),
  shifts: list,
}));
const week = { from: days[0].date, to: days[6].date, earned: 851, minutes: 1935, shifts: 5, days };

vi.mock("@/services/Summary", async (orig) => ({
  ...(await orig<typeof import("@/services/Summary")>()),
  summarizeWeek: () => week,
  summarizePeriod: () => ({ earned: 851 }),
}));
vi.mock("@/hooks/useUser", () => ({ default: () => ({ data: { config: {} } }) }));
vi.mock("@/hooks/useShiftsInCurrency", () => ({
  default: () => ({
    allHourly: [],
    allProduction: [],
    isLoading: false,
    otherCurrencies: [],
    convertedFrom: [],
    currency: "AUD",
    shiftsIn: () => ({ hourly: [], production: [] }),
  }),
}));
vi.mock("@/hooks/useMoney", () => ({
  default: () => (v: number, o?: { cents?: boolean }) =>
    "$" +
    v.toLocaleString("en-AU", {
      minimumFractionDigits: o?.cents ? 2 : 0,
      maximumFractionDigits: o?.cents ? 2 : 0,
    }),
  useCurrency: () => "AUD",
}));

import WeekSummary from "@/components/structures/Home/WeekSummary";

import { renderWithIntl } from "#/__test__/utils/intl";

describe("WeekSummary", () => {
  async function renderOn(day: Date, locale: "en" | "es") {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(day);
    renderWithIntl(<WeekSummary />, locale);
    await act(async () => {});
  }

  test("each day shows its initial and date, today marked", async () => {
    await renderOn(new Date(2026, 9, 22, 10), "es");

    const days = screen.getAllByRole("listitem");
    expect(days.map((d) => d.textContent)).toEqual([
      "L19",
      "M20",
      "X21",
      "J22",
      "V23",
      "S24",
      "D25",
    ]);
    expect(days[3]).toHaveAttribute("aria-current", "date");
    expect(within(days[3]).getByRole("button")).toHaveAccessibleName(/^jueves 22: \$215/);
    expect(within(days[2]).queryByRole("button")).toBeNull();
    expect(days[2].firstElementChild).toHaveAccessibleName("miércoles 21: sin turnos");
    vi.useRealTimers();
  });

  test("leads with the money; hours, shifts and the range follow", async () => {
    await renderOn(new Date(2026, 9, 22, 10), "en");

    expect(screen.getByText("19 to 25 Oct")).toBeInTheDocument();
    expect(screen.getByText("$851.00")).toBeInTheDocument();
    expect(screen.getByText("32.3h")).toBeInTheDocument();
    expect(screen.getByText("shifts")).toBeInTheDocument();
    vi.useRealTimers();
  });

  test("tapping a day names its shifts, two jobs apart", async () => {
    await renderOn(new Date(2026, 9, 22, 10), "en");
    vi.useRealTimers();
    const user = userEvent.setup();

    // One bar segment per shift.
    const thursday = screen.getAllByRole("listitem")[3];
    expect(thursday.querySelectorAll(".bg-week-bar-hourly")).toHaveLength(2);

    await user.click(within(thursday).getByRole("button"));
    const detail = await screen.findByRole("dialog");
    expect(within(detail).getByText("Thursday 22 October")).toBeInTheDocument();
    const rows = within(detail).getAllByRole("listitem");
    expect(rows.map((row) => row.textContent)).toEqual([
      "Box Maker7:00 AM–12:00 PM$120",
      "Web Developer6:00 PM–10:00 PM$95",
    ]);
    expect(within(detail).getByText("Day total")).toBeInTheDocument();
    expect(within(detail).getByText("$215")).toBeInTheDocument();
  });
});

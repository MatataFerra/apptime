import { act, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

const days = [
  { hourly: 186, production: 0, publicHoliday: false },
  { hourly: 210, production: 0, publicHoliday: false },
  { hourly: 0, production: 0, publicHoliday: false },
  { hourly: 120, production: 95, publicHoliday: false },
  { hourly: 240, production: 0, publicHoliday: true },
  { hourly: 0, production: 0, publicHoliday: false },
  { hourly: 0, production: 0, publicHoliday: false },
].map((d, i) => ({ ...d, date: new Date(2026, 9, 19 + i) }));
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
    expect(days[3]).toHaveAccessibleName(/^jueves 22: \$215/);
    expect(days[2]).toHaveAccessibleName("miércoles 21: sin turnos");
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
});

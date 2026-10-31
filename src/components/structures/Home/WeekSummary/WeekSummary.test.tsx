import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

function job(
  day: number,
  name: string,
  from: number,
  to: number,
  earned: number,
  source: "track" | "fast" = "fast"
) {
  return {
    kind: "hourly" as const,
    source,
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
  [job(22, "Box Maker", 7, 12, 120), job(22, "Web Developer", 18, 22, 95, "track")],
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
vi.mock("@/hooks/useUser", () => ({ default: () => ({ data: { config: {} }, isLoading: false }) }));
const loading = vi.hoisted(() => ({ shifts: false, rates: false }));
vi.mock("@/hooks/useShiftsInCurrency", () => ({
  default: () => ({
    allHourly: [],
    allProduction: [],
    isLoadingShifts: loading.shifts,
    isLoading: loading.shifts || loading.rates,
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

import { calendarDays } from "@/components/structures/Home/WeekSummary/shared";
import WeekSummaryCard from "@/components/structures/Home/WeekSummary/WeekSummaryCard";

import { wallClock } from "@/utils/helpers/userNow";

import { renderWithIntl } from "#/__test__/utils/intl";

describe("WeekSummary", () => {
  async function renderOn(day: Date, locale: "en" | "es") {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(day);
    // What the server shell passes: the range and calendar row it worked out.
    renderWithIntl(
      <WeekSummaryCard range="server range" days={calendarDays(days[0].date, day, locale)} />,
      locale
    );
    await act(async () => {});
  }

  test("while the shifts load, the server's range and calendar row show", async () => {
    loading.shifts = true;
    await renderOn(new Date(2026, 9, 22, 10), "es");

    expect(screen.getByText("server range")).toBeInTheDocument();
    const list = screen.getByRole("list", { name: "Ganancias por día" });
    expect(list).toHaveAttribute("aria-busy", "true");
    const items = within(list).getAllByRole("listitem");
    expect(items.map((d) => d.textContent)).toEqual([
      "L19",
      "M20",
      "X21",
      "J22",
      "V23",
      "S24",
      "D25",
    ]);
    expect(items[3]).toHaveAttribute("aria-current", "date");
    expect(within(list).queryByRole("button")).toBeNull();
    expect(screen.queryByText("32.3h")).toBeNull();
    loading.shifts = false;
    vi.useRealTimers();
  });

  test("hours and shifts show before the rates; money waits for them", async () => {
    loading.rates = true;
    await renderOn(new Date(2026, 9, 22, 10), "en");

    expect(screen.getByText("19 to 25 Oct")).toBeInTheDocument();
    expect(screen.getByText("32.3h")).toBeInTheDocument();
    expect(screen.queryByText("$851.00")).toBeNull();
    expect(screen.getByRole("list", { name: "Earnings per day" })).toHaveAttribute("aria-busy");
    loading.rates = false;
    vi.useRealTimers();
  });

  test("each day shows its initial and date, today marked", async () => {
    await renderOn(new Date(2026, 9, 22, 10), "es");

    const days = within(screen.getByRole("list", { name: "Ganancias por día" })).getAllByRole(
      "listitem"
    );
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

    // Two shifts: a dot each over the bar, in their module's colour. One-shift days have none.
    const [monday, , , thursday] = within(
      screen.getByRole("list", { name: "Earnings per day" })
    ).getAllByRole("listitem");
    const dots = within(thursday).getByTestId("day-dots");
    expect([...dots.children].map((dot) => dot.className)).toEqual([
      expect.stringContaining("bg-week-bar-fast"),
      expect.stringContaining("bg-week-bar-track"),
    ]);
    expect(within(monday).queryByTestId("day-dots")).toBeNull();
    // The legend names the modules present, and the hatching for Friday's holiday.
    expect(screen.getByText("Fast charge")).toBeInTheDocument();
    expect(screen.getByText("Track")).toBeInTheDocument();
    expect(screen.getByText("Public holiday")).toBeInTheDocument();

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

describe("wallClock", () => {
  test("reads the user's day, not the server's", () => {
    // 23:30 UTC on Saturday is already Sunday morning in Auckland.
    const now = new Date(Date.UTC(2026, 9, 31, 23, 30));
    const auckland = wallClock("Pacific/Auckland", now);
    expect([auckland.getDate(), auckland.getHours(), auckland.getMinutes()]).toEqual([1, 12, 30]);
    const buenosAires = wallClock("America/Argentina/Buenos_Aires", now);
    expect([buenosAires.getDate(), buenosAires.getHours()]).toEqual([31, 20]);
  });
});

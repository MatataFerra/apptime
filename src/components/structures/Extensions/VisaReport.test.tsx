import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

const data = vi.hoisted(() => {
  function day(offset: number) {
    const date = new Date();
    date.setHours(8, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    return date;
  }
  function shift(id: number, offset: number, employerId: number | null) {
    const start = day(offset);
    return {
      id,
      name: null,
      startDate: start.toString(),
      endDate: new Date(start.valueOf() + 8 * 3600e3).toString(),
      amount: 480,
      isPublicHoliday: false,
      publicHolidayWorked: false,
      isClosed: true,
      notes: null,
      hourValue: 25,
      unpaidBreaks: 0,
      currency: null,
      source: null,
      taxes: [],
      employerId,
    };
  }
  return {
    hourly: [
      // Two days apart from a 30-day break, one without employer, one in NZ.
      shift(1, 40, 1),
      shift(2, 39, 1),
      shift(3, 8, null),
      shift(4, 5, 2),
    ],
    employers: [
      { id: 1, name: "Berry Farm", country: "Australia", taxId: "51 824 753 556", archived: false },
      { id: 2, name: "Kiwi Orchard", country: "New Zealand", taxId: null, archived: false },
    ],
  };
});

vi.mock("@/hooks/useHourlyShifts", () => ({
  default: () => ({ data: data.hourly, isLoading: false }),
}));
vi.mock("@/hooks/useProductionShifts", () => ({
  default: () => ({ data: [], isLoading: false }),
}));
vi.mock("@/hooks/useEmployers", () => ({
  default: () => ({
    employers: data.employers,
    byId: new Map(data.employers.map((e) => [e.id, e])),
    isLoading: false,
  }),
}));
vi.mock("@/hooks/useUser", () => ({
  default: () => ({ data: { config: { weekStartsOn: "monday" } } }),
}));

import VisaReport from "@/components/structures/Extensions/VisaReport";

import { renderWithIntl } from "#/__test__/utils/intl";

describe("Visa report", () => {
  test("counts Australian days, the shift without employer in red, and the break", () => {
    renderWithIntl(<VisaReport />);

    // From the first Australian shift to today: 2 confirmed days + 1 assumed.
    expect(screen.getByTestId("visa-total-days")).toHaveTextContent("3");
    expect(screen.getByText(/1 day has no employer/)).toBeInTheDocument();
    expect(screen.getAllByTestId("visa-gap")).toHaveLength(1);
    expect(screen.getByText("Berry Farm")).toBeInTheDocument();
    expect(screen.getByText("Shifts without employer")).toBeInTheDocument();
    expect(screen.getByText(/1 shift for an employer in another country/)).toBeInTheDocument();
  });

  test("switching to New Zealand counts its employer instead", async () => {
    const user = userEvent.setup();
    renderWithIntl(<VisaReport />);

    await user.click(screen.getByTestId("visa-program-nz-3m"));
    // From the NZ shift to today: the shift without employer is before it.
    expect(screen.getByTestId("visa-total-days")).toHaveTextContent("1");
    expect(screen.getByText("Kiwi Orchard")).toBeInTheDocument();
    expect(screen.queryByText("Berry Farm")).not.toBeInTheDocument();
  });
});

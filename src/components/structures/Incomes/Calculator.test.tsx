import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import IncomesCalculator from "./Calculator";
import { renderWithIntl } from "#/__test__/utils/intl";

// The calculator reads Settings (currency, rate) from the user.
const user = vi.hoisted(() => ({ current: null as null | { config: Record<string, unknown> } }));
vi.mock("@/hooks/useUser", () => ({ default: () => ({ data: user.current }) }));

// Saved taxes for the picker.
vi.mock("@/hooks/useSalaryItems", () => ({
  default: () => ({
    isLoading: false,
    data: {
      salaryItems: {
        taxes: [{ id: 1, name: "PAYE", value: 10, description: null }],
        contributions: [],
      },
    },
  }),
}));

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function fillDay(hours: string, rate: string, days: string) {
  fireEvent.change(screen.getByLabelText("Hours a day"), { target: { value: hours } });
  fireEvent.change(screen.getByLabelText("Hourly rate"), { target: { value: rate } });
  fireEvent.click(screen.getByRole("button", { name: days }));
}

describe("IncomesCalculator", () => {
  beforeEach(() => {
    user.current = null;
  });

  test("renders the component", () => {
    renderWithIntl(<IncomesCalculator />);
    expect(screen.getByLabelText("Hours a day")).toBeInTheDocument();
  });

  test("can change the hours", () => {
    renderWithIntl(<IncomesCalculator />);
    const hoursInput = screen.getByLabelText("Hours a day");

    fireEvent.change(hoursInput, { target: { value: "8" } });
    expect(hoursInput).toHaveValue(8);
  });

  test("calculates the income with no holiday pay added", () => {
    renderWithIntl(<IncomesCalculator />);
    fillDay("8", "10", "2");

    // 8h x $10 x 2 days, nothing on top.
    expect(screen.getByTestId("estimate-total")).toHaveTextContent(money(160));
    expect(screen.queryByLabelText("Holiday pay")).not.toBeInTheDocument();
  });

  test("takes a saved tax off the total", () => {
    renderWithIntl(<IncomesCalculator />);
    fillDay("8", "25", "1");
    fireEvent.click(screen.getByRole("button", { name: /PAYE/ }));

    // $200 - 10%
    expect(screen.getByTestId("estimate-total")).toHaveTextContent(money(180));
    expect(screen.getByTestId("estimate-taxes")).toHaveTextContent(money(20));
    expect(screen.getByText("You'd earn, after taxes")).toBeInTheDocument();
  });

  test("starts from the rate saved in Settings", () => {
    user.current = { config: { hourValue: 30, currency: "USD" } };
    renderWithIntl(<IncomesCalculator />);
    expect(screen.getByLabelText(/hourly rate/i)).toHaveValue(30);
  });
});

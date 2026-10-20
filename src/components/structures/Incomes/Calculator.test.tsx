import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import IncomesCalculator from "./Calculator";

// The calculator reads Settings (currency, holiday pay, rate) from the user.
const user = vi.hoisted(() => ({ current: null as null | { config: Record<string, unknown> } }));
vi.mock("@/hooks/useUser", () => ({ default: () => ({ data: user.current }) }));

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

describe("IncomesCalculator", () => {
  beforeEach(() => {
    user.current = null;
  });

  test("renders the component", () => {
    render(<IncomesCalculator />);
    expect(screen.getByLabelText("Hours a day")).toBeInTheDocument();
  });

  test("can change the hours", () => {
    render(<IncomesCalculator />);
    const hoursInput = screen.getByLabelText("Hours a day");

    fireEvent.change(hoursInput, { target: { value: "8" } });
    expect(hoursInput).toHaveValue(8);
  });

  test("calculates the income correctly", () => {
    render(<IncomesCalculator />);

    fireEvent.change(screen.getByLabelText("Hours a day"), { target: { value: "8" } });
    fireEvent.change(screen.getByLabelText("Hourly rate"), { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "2" }));

    // 8h x $10 x 2 days + 8% holiday pay
    expect(screen.getByTestId("estimate-total")).toHaveTextContent(money(8 * 10 * 2 * 1.08));
  });

  test("uses the default holiday pay when the field is empty", () => {
    render(<IncomesCalculator />);

    fireEvent.change(screen.getByLabelText("Hours a day"), { target: { value: "8" } });
    fireEvent.change(screen.getByLabelText("Hourly rate"), { target: { value: "25" } });
    fireEvent.change(screen.getByLabelText("Holiday pay"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "1" }));

    expect(screen.getByTestId("estimate-total")).toHaveTextContent(money(216));
  });

  test("displays default holiday pay rate", () => {
    render(<IncomesCalculator />);
    expect(screen.getByLabelText("Holiday pay")).toHaveValue(8);
  });

  test("starts from the holiday pay and rate saved in Settings", () => {
    user.current = { config: { holidayPay: 12, hourValue: 30, currency: "USD" } };
    render(<IncomesCalculator />);
    expect(screen.getByLabelText("Holiday pay")).toHaveValue(12);
    expect(screen.getByLabelText(/hourly rate/i)).toHaveValue(30);
  });
});

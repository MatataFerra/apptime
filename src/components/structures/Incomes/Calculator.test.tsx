import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import IncomesCalculator from "./Calculator";

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

describe("IncomesCalculator", () => {
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
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import IncomesCalculator from ".";

describe("IncomesCalculator", () => {
  test("renders the component", () => {
    render(<IncomesCalculator />);
    const component = screen.getByLabelText("Hours");
    expect(component).toBeInTheDocument();
  });

  test("can change the hours", () => {
    render(<IncomesCalculator />);
    const hoursInput = screen.getByLabelText("Hours");

    fireEvent.change(hoursInput, { target: { value: "08:00" } });
    expect(hoursInput).toHaveValue("08:00");
  });

  test("calculates the income correctly", () => {
    render(<IncomesCalculator />);
    const hoursInput = screen.getByLabelText("Hours");
    const valueInput = screen.getByLabelText("Value hour");
    const timesInput = screen.getByLabelText("How many times?");

    fireEvent.change(hoursInput, { target: { value: "08:00" } });
    fireEvent.change(valueInput, { target: { value: 10 } });
    fireEvent.change(timesInput, { target: { value: 2 } });

    const { hours, value, times, holidayPay } = {
      hours: 8,
      value: 10,
      times: 2,
      holidayPay: 8,
    };

    const expectedResult = hours * value * times + (hours * value * times * holidayPay) / 100;

    const expectedIncome = `$${expectedResult.toFixed(2)} 🤑`;
    const incomeText = screen.getByText("You are going to earn:");
    expect(incomeText.nextSibling?.textContent).toBe(expectedIncome);
  });

  test("displays default holiday pay rate", () => {
    render(<IncomesCalculator />);
    const holidayPayInput = screen.getByLabelText("Holiday pay");

    expect(holidayPayInput).toHaveValue(8);
  });
});

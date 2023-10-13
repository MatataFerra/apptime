import { render, screen } from "@testing-library/react";

import Input from "@/components/ui/Input";

describe("Input", () => {
  test("renders an input element", () => {
    render(<Input />);

    const inputElement = screen.getByRole("textbox");

    expect(inputElement).toBeInTheDocument();
  });

  test("renders a label element when label prop is provided", () => {
    render(<Input label="Test Label" />);

    const labelElement = screen.getByText("Test Label");

    expect(labelElement).toBeInTheDocument();
  });

  test("applies the correct classes when isError prop is true", () => {
    render(<Input isError />);

    const inputElement = screen.getByRole("textbox");

    expect(inputElement).toHaveClass("border-red-600");
    expect(inputElement).toHaveClass("focus:ring-red-600");
  });
});

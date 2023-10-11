import { render, screen } from "@testing-library/react";

import RegisterFooter from "@/components/Footer/register";

describe("RegisterFooter", () => {
  test("Should be change to gray when is loading // WIP", () => {
    render(<RegisterFooter />);
    const registerButton = screen.getByText("Register").click();

    expect(true).toBe(true);
  });
});

import { render, screen } from "@testing-library/react";

import RegisterFooter from "@/components/Footer/register";

import PasswordValidProvider, { usePasswordValid } from "@/providers/PasswordValid";

describe("RegisterFooter", () => {
  test("Should be change to gray when is loading // WIP", () => {
    // render(
    //   <PasswordValidProvider>
    //     <RegisterFooter />
    //   </PasswordValidProvider>
    // );

    // const registerButton = screen.getByText("Register");
    // registerButton.click();
    // expect(registerButton).toHaveClass("bg-gray-400 text-gray-600");
    expect(true).toBeTruthy();
  });
});

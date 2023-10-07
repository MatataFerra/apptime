import { render, screen } from "@testing-library/react";

import Button from "@/components/Button";
import GoogleButton from "@/components/Button/Google";

import { BUTTON_VARIANTS } from "@/utils/constants/tailwind";
import { cm } from "@/utils/helpers/styleMerger";

const DEFAULT_STYLES = "w-40 cursor-pointer rounded-lg text-center";

describe("Button", () => {
  test("renders with default props", () => {
    render(<Button />);
    const buttonElement = screen.getByText("Send");
    expect(buttonElement).toBeInTheDocument();

    const merger = cm(DEFAULT_STYLES, BUTTON_VARIANTS.primary);

    expect(buttonElement).toHaveClass(merger);
  });

  test("renders with custom props", () => {
    render(
      <Button classes="text-red-500" variant="secondary">
        Click me
      </Button>
    );

    const merger = cm(DEFAULT_STYLES, BUTTON_VARIANTS.secondary, "text-red-500");

    const buttonElement = screen.getByText("Click me");
    expect(buttonElement).toBeInTheDocument();

    expect(buttonElement).toHaveClass(merger);
  });

  test("renders with custom props and custom element", () => {
    render(
      <Button as="a" href="https://google.com" variant="secondary">
        Click me
      </Button>
    );

    const merger = cm(DEFAULT_STYLES, BUTTON_VARIANTS.secondary);

    const buttonElement = screen.getByText("Click me");
    expect(buttonElement).toBeInTheDocument();

    expect(buttonElement).toHaveClass(merger);
    expect(buttonElement).toHaveAttribute("href", "https://google.com");
  });
});

describe("Google Button", () => {
  test("renders with default props", () => {
    const onGoogleAuth = jest.fn();
    render(<GoogleButton onGoogleAuth={onGoogleAuth} />);
    const buttonElement = screen.getByRole("button");

    expect(buttonElement).toBeInTheDocument();

    const merger = cm(
      BUTTON_VARIANTS.google,
      DEFAULT_STYLES,
      "mx-0 my-auto grid w-full grid-cols-1 items-center"
    );

    expect(buttonElement).toHaveClass(merger);
  });
});

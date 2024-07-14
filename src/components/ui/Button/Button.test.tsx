import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import GoogleButton from "@/components/ui/Button/Google";

import { BUTTON_VARIANTS } from "@/utils/constants/tailwind";
import { cm } from "@/utils/helpers/styleMerger";

import Button from "./";

const DEFAULT_STYLES = "w-40 cursor-pointer rounded-lg text-center";

describe("Button", () => {
  test("renders with default props", () => {
    render(<Button>Send</Button>);
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
});

describe("Google Button", () => {
  test("renders with default props", () => {
    const onGoogleAuth = vi.fn();
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

import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import GoogleButton from "@/components/ui/Button/Google";

import Button, { buttonVariants, resolveButtonVariant } from "./";

describe("Button", () => {
  test("renders with default props", () => {
    render(<Button>Send</Button>);
    const buttonElement = screen.getByText("Send");
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement.className).toContain(buttonVariants({ variant: "primary", size: "lg" }));
    expect(buttonElement).toHaveClass("w-40");
  });

  test("renders with custom props", () => {
    render(
      <Button classes="text-red-500" variant="secondary">
        Click me
      </Button>
    );

    const buttonElement = screen.getByText("Click me");
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveClass("bg-surface-sunken", "text-red-500");
  });

  test("maps legacy variant names to the new set", () => {
    expect(resolveButtonVariant("black")).toBe("primary");
    expect(resolveButtonVariant("outlined")).toBe("outline");
    expect(resolveButtonVariant("danger")).toBe("danger");
  });
});

describe("Google Button", () => {
  test("renders with default props", () => {
    const onGoogleAuth = vi.fn();
    render(<GoogleButton onGoogleAuth={onGoogleAuth} />);
    const buttonElement = screen.getByRole("button");

    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveClass("border-border-strong", "bg-surface", "w-full");
  });
});

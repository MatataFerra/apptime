import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import Toaster from "@/components/ui/Toast/toaster";

import showToast, { type ToastOptions } from "../../src/services/Toast";

function MockComponent({ options }: { options: ToastOptions }) {
  return (
    <main>
      <button type="button" data-testid="trigger" onClick={() => showToast(options)} />
      <Toaster />
    </main>
  );
}

function show(options: ToastOptions) {
  render(<MockComponent options={options} />);
  act(() => {
    screen.getByTestId("trigger").click();
  });
  return document.querySelector<HTMLElement>("[data-type]");
}

describe("Toast", () => {
  afterEach(() => cleanup());

  test("renders inside the notifications region", () => {
    show({ type: "success", message: "Test message" });
    expect(screen.getByRole("region")).toBeInTheDocument();
  });

  test("shows the message and description", () => {
    show({ type: "success", message: "Test message", description: "More detail" });
    expect(screen.getByText("Test message")).toBeInTheDocument();
    expect(screen.getByText("More detail")).toBeInTheDocument();
  });

  test.each(["success", "error", "warning", "info", "loading", "plain"] as const)(
    "uses the %s type as the toast variant",
    (type) => {
      const toast = show({ type, message: "Test message" });
      expect(toast).toHaveAttribute("data-type", type);
    }
  );

  test("errors are announced as alerts", () => {
    const toast = show({ type: "error", message: "Test message" });
    expect(toast).toHaveAttribute("role", "alert");
  });

  test("renders a custom action", () => {
    show({ type: "info", message: "Test message", action: <p>Loading...</p> });
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("can be dismissed", () => {
    show({ type: "info", message: "Test message" });
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
  });
});

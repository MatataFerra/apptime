import { act, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Toaster } from "@/components/ui/Toast/toaster";

import showToast, { type ToastOptions } from "../../src/services/Toast";

function MockComponent({ options }: { options: ToastOptions }) {
  return (
    <main>
      <button onClick={() => showToast(options)}></button>
      <Toaster />
    </main>
  );
}
describe("Toast", () => {
  test("should render toast", () => {
    const options: ToastOptions = {
      type: "success",
      message: "Test message",
    };

    render(<MockComponent options={options} />);
    act(() => {
      screen.getByRole("button").click();
    });

    const toastElement = screen.getByRole("region");
    expect(toastElement).toBeInTheDocument();
  });

  test("should render toast with correct message", () => {
    const options: ToastOptions = {
      type: "success",
      message: "Test message",
    };

    render(<MockComponent options={options} />);
    act(() => {
      screen.getByRole("button").click();
    });

    const toastElement = screen.getByText("Test message");
    expect(toastElement).toBeInTheDocument();
  });

  test("should render toast with correct success type", () => {
    const options: ToastOptions = {
      type: "success",
      message: "Test message",
    };

    render(<MockComponent options={options} />);
    act(() => {
      screen.getByRole("button").click();
    });

    const toastElement = screen.queryAllByRole("status")[0];
    expect(toastElement).toHaveClass("bg-green-500");
  });

  test("should render toast with correct error type", () => {
    const options: ToastOptions = {
      type: "error",
      message: "Test message",
    };

    render(<MockComponent options={options} />);
    act(() => {
      screen.getByRole("button").click();
    });

    const toastElement = screen.queryAllByRole("status")[0];
    expect(toastElement).toHaveClass("bg-red-500");
  });

  test("should render toast with correct warning type", () => {
    const options: ToastOptions = {
      type: "warning",
      message: "Test message",
    };

    render(<MockComponent options={options} />);
    act(() => {
      screen.getByRole("button").click();
    });

    const toastElement = screen.queryAllByRole("status")[0];
    expect(toastElement).toHaveClass("bg-yellow-500");
  });

  test("should render toast with correct info type", () => {
    const options: ToastOptions = {
      type: "info",
      message: "Test message",
    };

    render(<MockComponent options={options} />);
    act(() => {
      screen.getByRole("button").click();
    });

    const toastElement = screen.queryAllByRole("status")[0];
    expect(toastElement).toHaveClass("bg-sky-500");
  });

  test("should render toast with action and match snap", () => {
    const options: ToastOptions = {
      type: "info",
      message: "Test message",
      action: <p>Loading...</p>,
    };

    render(<MockComponent options={options} />);
    act(() => {
      screen.getByRole("button").click();
    });

    const toastElement = screen.queryAllByRole("status")[0];

    expect(toastElement).toMatchSnapshot();
  });
});

import { render } from "@testing-library/react";
import { describe,expect, test } from 'vitest'

import Loader from "./";

describe("Loader component", () => {
  test("renders without crashing", () => {
    render(<Loader />);
  });

  test("displays the loading text", () => {
    const { getByText } = render(<Loader loading type="text" />);
    const loadingText = getByText("Loading...");
    expect(loadingText).toBeInTheDocument();
  });

  test("displays the loading spinner", () => {
    const { getByRole } = render(<Loader loading type="spinner" />);
    const loadingSpinner = getByRole("status");
    expect(loadingSpinner).toBeInTheDocument();
  });

  test("Should not displays loader when loading is true", () => {
    const { queryByRole } = render(<Loader loading={false} type="spinner" />);
    const loadingSpinner = queryByRole("status");
    expect(loadingSpinner).not.toBeInTheDocument();
  });

  // Add more tests as needed
});

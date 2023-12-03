import { render } from "@testing-library/react";

import Loader from "./";

describe("Loader component", () => {
  it("renders without crashing", () => {
    render(<Loader />);
  });

  it("displays the loading text", () => {
    const { getByText } = render(<Loader loading type="text" />);
    const loadingText = getByText("Loading...");
    expect(loadingText).toBeInTheDocument();
  });

  it("displays the loading spinner", () => {
    const { getByRole } = render(<Loader loading type="spinner" />);
    const loadingSpinner = getByRole("status");
    expect(loadingSpinner).toBeInTheDocument();
  });

  it("Should not displays loader when loading is true", () => {
    const { queryByRole } = render(<Loader loading={false} type="spinner" />);
    const loadingSpinner = queryByRole("status");
    expect(loadingSpinner).not.toBeInTheDocument();
  });

  // Add more tests as needed
});

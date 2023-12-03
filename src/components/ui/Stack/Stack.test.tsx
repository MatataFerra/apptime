import { render } from "@testing-library/react";

import Stack from "./";

describe("Stack component", () => {
  it("renders without errors", () => {
    render(<Stack />);
  });

  it("renders children correctly", () => {
    const { getByText } = render(
      <Stack>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </Stack>
    );

    expect(getByText("Child 1")).toBeInTheDocument();
    expect(getByText("Child 2")).toBeInTheDocument();
    expect(getByText("Child 3")).toBeInTheDocument();
  });

  it("applies the correct classes and styles", () => {
    const { container } = render(
      <Stack
        as="section"
        classes="my-stack"
        orientation="vertical"
        justifyContent="center"
        alignItems="end"
        spacing={4}
        grid
        cols="1fr 2fr"
        rows={2}
      >
        <div>Child 1</div>
        <div>Child 2</div>
      </Stack>
    );

    const stackElement = container.firstChild;

    expect(stackElement).toHaveClass("my-stack");
    expect(stackElement).toHaveClass("grid");
    expect(stackElement).toHaveStyle("gap: 1rem");
    expect(stackElement).toHaveStyle("grid-template-columns: 1fr 2fr");
    expect(stackElement).toHaveStyle("grid-template-rows: repeat(2, minmax(0, 1fr))");
  });
});

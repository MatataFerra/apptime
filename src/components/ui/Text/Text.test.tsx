import React from "react";

import { render, screen } from "@testing-library/react";

import Text from "@/components/ui/Text";

describe("Text", () => {
  it("should render without crashing", () => {
    render(<Text>Text</Text>);
    expect(screen.getByText("Text")).toBeInTheDocument();
  });

  it("should render with the correct color", () => {
    render(<Text classes="text-red-600">Text</Text>);
    expect(screen.getByText("Text")).toHaveStyle({ color: "rgb(220 38 38 / 1" });
  });

  it("should work as a span", () => {
    render(
      <Text as="span" data-testid="test-text">
        Text
      </Text>
    );
    expect(screen.getByTestId("test-text").nodeName.toLowerCase()).toBe("span");
  });
});

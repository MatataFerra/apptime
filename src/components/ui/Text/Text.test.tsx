import React from "react";

import { render, screen } from "@testing-library/react";
import { describe,expect, test } from 'vitest'

import Text from "@/components/ui/Text";

describe("Text", () => {
  test("should render without crashing", () => {
    render(<Text>Text</Text>);
    expect(screen.getByText("Text")).toBeInTheDocument();
  });

  test("should render with the correct color", () => {
    render(<Text classes="text-red-600">Text</Text>);
    expect(screen.getByText("Text")).toHaveStyle({ color: "rgb(220 38 38 / 1" });
  });

  test("should work as a span", () => {
    render(
      <Text as="span" data-testid="test-text">
        Text
      </Text>
    );
    expect(screen.getByTestId("test-text").nodeName.toLowerCase()).toBe("span");
  });
});

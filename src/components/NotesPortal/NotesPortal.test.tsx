import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import Portal from "../ui/Portal";

describe("Portal", () => {
  test("renders children when isOn is true", () => {
    const { baseElement, container } = render(
      <Portal isOn={true}>
        <section>Portal</section>
      </Portal>
    );

    expect(baseElement).toMatchSnapshot();
    expect(baseElement.querySelector("div")).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  test("renders children when isOn is false", () => {
    const { baseElement, container } = render(
      <Portal isOn={false}>
        <section>Portal</section>
      </Portal>
    );

    expect(baseElement).toMatchSnapshot();
    expect(baseElement.querySelector("section")).toBeNull();
    expect(container).toMatchSnapshot();
  });
});

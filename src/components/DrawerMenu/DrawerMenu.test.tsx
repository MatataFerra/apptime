import { fireEvent, render, screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import { describe, expect, test, vi } from "vitest";

import Button from "../ui/Button";
import Drawer from "../ui/Drawer";
import Icon from "../ui/Icons";
import { useDrawerStore } from "@/store/useDrawerStore";

describe("DrawerMenu", () => {
  test("renders DrawerMenu component", () => {
    render(
      <Drawer data-testid="drawer-menu" isOpen={true} handleOutsideClick={() => {}}>
        <section>content</section>
      </Drawer>
    );

    // Assert that the DrawerMenu component is rendered
    const drawerMenuElement = screen.getByTestId("drawer-menu");
    expect(drawerMenuElement).toBeInTheDocument();
  });

  test("calls handleOutsideClick when click close", () => {
    const useMoviesSpy = vi.spyOn(useDrawerStore, "setState");
    const handleOutsideClickMock = vi.fn().mockImplementation(() => {});
    useMoviesSpy.mockImplementationOnce(() => ({ isOpen: true, toggle: () => {} }));

    render(
      <Drawer data-testid="drawer-menu" isOpen={true}>
        <section>content</section>
        <Button
          data-testid="button"
          type="button"
          variant="outlined"
          classes="w-fit bg-transparent"
          onClick={handleOutsideClickMock}
        >
          <Icon.cancel />
        </Button>
      </Drawer>
    );

    // // Assert that the DrawerMenu component is rendered
    const drawerMenuElement = screen.getByTestId("drawer-menu");
    expect(drawerMenuElement).toBeInTheDocument();

    // // Click on the button
    fireEvent.click(screen.getByTestId("button"));

    // // Assert that the handleOutsideClick is called
    expect(handleOutsideClickMock).toHaveBeenCalled();
  });
});

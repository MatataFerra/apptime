import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import clientEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import Button from "../../ui/Button";
import Icon from "../../ui/Icons";
import SideMenu from "../../ui/SideMenu";
import { useDrawerStore } from "@/store/useDrawerStore";

describe("DrawerMenu", () => {
  const user = clientEvent.setup();
  test("renders DrawerMenu component", () => {
    render(
      <SideMenu data-testid="drawer-menu" isOpen={true} handleOutsideClick={() => {}}>
        <section>content</section>
      </SideMenu>
    );

    // Assert that the DrawerMenu component is rendered
    const drawerMenuElement = screen.getByTestId("drawer-menu");
    expect(drawerMenuElement).toBeInTheDocument();
  });

  test("calls handleOutsideClick when click close", async () => {
    const useDrawerSpy = vi.spyOn(useDrawerStore.getState(), "toggle");
    const { result } = renderHook(() => useDrawerStore());
    const handleOutsideClickMock = vi.fn().mockImplementation(() => result.current.toggle());

    render(
      <SideMenu data-testid="drawer-menu" isOpen={true}>
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
      </SideMenu>
    );

    await act(async () => {
      await user.click(await screen.findByRole("button"));
    });

    expect(useDrawerSpy).toHaveBeenCalled();
  });

  test("should unmount DrawerMenu component when click close", async () => {
    const { result } = renderHook(() => useDrawerStore());
    const handleOutsideClickMock = vi.fn().mockImplementation(() => result.current.toggle());

    render(
      <SideMenu
        data-testid="drawer-menu"
        isOpen={result.current.isOpen}
        handleOutsideClick={handleOutsideClickMock}
      >
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
      </SideMenu>
    );

    fireEvent.click(screen.getByTestId("button"));

    const drawerMenuElement = screen.queryByTestId("drawer-menu");
    waitFor(() => {
      expect(drawerMenuElement).not.toBeInTheDocument();
    });
  });
});

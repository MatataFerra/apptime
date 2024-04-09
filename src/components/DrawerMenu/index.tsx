"use client";

import DrawerOptions from "@/components/DrawerOptions";
import Button from "@/components/ui/Button";
import Drawer from "@/components/ui/Drawer";
import Icon from "@/components/ui/Icons";
import Line from "@/components/ui/Line";
import Stack from "@/components/ui/Stack";

import { useDrawerStore } from "@/store/useDrawerStore";

type Props = {
  children: React.ReactElement;
};

function DrawerMenu({ children }: Props) {
  const isOpen = useDrawerStore((state) => state.isOpen);
  const toggle = useDrawerStore((state) => state.toggle);

  return (
    <>
      <Drawer isOpen={isOpen} handleOutsideClick={() => toggle()}>
        <Stack justifyContent="between" classes="z-10 w-full">
          {children}
          <Button
            type="button"
            variant="outlined"
            classes="w-fit bg-transparent"
            onClick={() => toggle()}
          >
            <Icon.cancel />
          </Button>
        </Stack>
        <Stack orientation="vertical" classes="my-2 w-full">
          <Line color="bg-stone-300" />
        </Stack>
        <DrawerOptions />
      </Drawer>
    </>
  );
}

export default DrawerMenu;

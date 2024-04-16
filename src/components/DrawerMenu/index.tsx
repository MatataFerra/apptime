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
      <Drawer
        isOpen={isOpen}
        classes="top-3/4 isolate z-10 h-[60dvh] w-7/12 rounded-lg border border-slate-100/70 bg-gradient-to-b from-white via-stone-100/95 to-slate-300/35 shadow-2xl backdrop-blur-md"
      >
        <Stack justifyContent="between" classes="z-10 w-full">
          {children}
          <Button
            type="button"
            variant="outlined"
            classes="w-fit bg-transparent"
            onClick={() => toggle()}
          >
            <Icon.cancel className="scale-50 transform" />
          </Button>
        </Stack>
        <Stack as="div" orientation="vertical" classes="w-full">
          <Line color="bg-stone-300" />
        </Stack>
        <DrawerOptions />
      </Drawer>
    </>
  );
}

export default DrawerMenu;

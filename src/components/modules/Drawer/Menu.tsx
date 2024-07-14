"use client";

import Options from "@/components/structures/Drawer/Options";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icons";
import Line from "@/components/ui/Line";
import SideMenu from "@/components/ui/SideMenu";
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
      <SideMenu
        handleOutsideClick={() => toggle()}
        isOpen={isOpen}
        classes="top-3/4 isolate z-50 h-[80dvh] w-[60dvw] rounded-lg border border-slate-100/70 bg-gradient-to-b from-white via-stone-100/95 to-slate-300/35 shadow-2xl backdrop-blur-md"
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
        <Options />
      </SideMenu>
    </>
  );
}

export default DrawerMenu;

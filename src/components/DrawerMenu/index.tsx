"use client";

import Button from "@/components/ui/Button";
import Drawer from "@/components/ui/Drawer";
import Stack from "@/components/ui/Stack";

import { useDrawerStore } from "@/store/useDrawerStore";

function DrawerMenu() {
  const isOpen = useDrawerStore((state) => state.isOpen);
  const toggle = useDrawerStore((state) => state.toggle);

  return (
    <>
      <Drawer isOpen={isOpen} handleOutsideClick={() => toggle()}>
        <Button onClick={() => toggle()}>X</Button>
      </Drawer>
    </>
  );
}

export default DrawerMenu;

"use client";

import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icons";

import { useDrawerStore } from "@/store/useDrawerStore";

function Ham() {
  const toggleDrawer = useDrawerStore((state) => state.toggle);
  return (
    <Button
      aria-label="Toggle drawer"
      data-testid="ham"
      type="button"
      variant="outlined"
      classes="group h-fit w-fit p-0"
      onClick={() => toggleDrawer()}
    >
      <Icon.ham width={32} height={32} />
    </Button>
  );
}

export default Ham;

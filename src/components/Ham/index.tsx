"use client";

import Button from "@/components/ui/Button";
import Img from "@/components/ui/Image";

import { useDrawerStore } from "@/store/useDrawerStore";

function Ham() {
  const toggleDrawer = useDrawerStore((state) => state.toggle);
  return (
    <Button
      data-testid="ham"
      type="button"
      variant="outlined"
      classes="w-fit"
      onClick={() => toggleDrawer()}
    >
      <Img src="/assets/ham-menu.svg" alt="arrow-left" classes="size-12" width={0} height={0} />
    </Button>
  );
}

export default Ham;

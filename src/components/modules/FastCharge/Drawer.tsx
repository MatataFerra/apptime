"use client";

import dynamic from "next/dynamic";

import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

const SalaryDrawer = dynamic(() => import("@/components/modules/FastCharge/SalaryDrawer"), {
  ssr: false,
  loading: () => <Skeleton classes="h-12 w-full" />,
});

function Drawer() {
  return (
    <Stack classes="my-4 w-full">
      <SalaryDrawer>
        <Button variant="black" classes="w-full">
          Advanced options
        </Button>
      </SalaryDrawer>
    </Stack>
  );
}

export default Drawer;

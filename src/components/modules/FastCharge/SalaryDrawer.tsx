"use client";

/**
 * !Fast-Charge
 */

import type { PropsWithChildren } from "react";

import dynamic from "next/dynamic";

import Button from "@/components/ui/Button";
import {
  Drawer as DrawerContainer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/Drawer";
import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

import { useHourlyTaxesOrContributionsStore } from "@/store/useTaxOrContributionStore";

const Drawer = dynamic(() => import("@/components/structures/SalaryItems/Drawer"), {
  ssr: false,
  loading: () => <Skeleton classes="h-12 w-full" />,
});

function SalaryDrawer({ children }: PropsWithChildren) {
  const { taxesModule } = useHourlyTaxesOrContributionsStore((state) => state);

  return (
    <>
      <DrawerContainer shouldScaleBackground>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Advanced options</DrawerTitle>
            <DrawerDescription>Set your shift with advanced options</DrawerDescription>
          </DrawerHeader>
          <Stack spacing={4} classes="p-4">
            <Drawer store={{ ...taxesModule }}>
              <Button variant="white" classes="h-20 w-full border-none text-xs shadow-md">
                Taxes
              </Button>
            </Drawer>
          </Stack>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="black" size="md" classes="w-auto text-base">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </DrawerContainer>
    </>
  );
}

export default SalaryDrawer;

"use client";

import dynamic from "next/dynamic";

import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

import { useHourlyTaxesStore } from "@/store/useTaxStore";

const TaxesDrawer = dynamic(() => import("@/components/structures/Taxes/Drawer/Drawer"), {
  ssr: false,
  loading: () => <Skeleton classes="h-12 w-full" />,
});

function Drawer() {
  const { addTax, clearTaxes, removeTax, setSaveTaxes, taxes } = useHourlyTaxesStore(
    (state) => state
  );
  return (
    <Stack classes="my-8 w-full">
      <TaxesDrawer
        addTax={addTax}
        taxes={taxes}
        clearTaxes={clearTaxes}
        setSaveTaxes={setSaveTaxes}
        removeTax={removeTax}
      >
        <Button variant="black" classes="w-full">
          Advanced options
        </Button>
      </TaxesDrawer>
    </Stack>
  );
}

export default Drawer;

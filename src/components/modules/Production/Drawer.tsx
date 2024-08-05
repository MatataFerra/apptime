"use client";

import dynamic from "next/dynamic";

import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

import { useProductionTaxesStore } from "@/store/useTaxStore";

const TaxesDrawer = dynamic(() => import("@/components/structures/Taxes/Drawer/Drawer"), {
  ssr: false,
  loading: () => <Skeleton classes="h-12 w-full" />,
});

function Drawer() {
  const { taxes, clearTaxes, setSaveTaxes, addTax, removeTax } = useProductionTaxesStore(
    (state) => state
  );

  return (
    <Stack classes="w-full">
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

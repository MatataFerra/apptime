"use client";

import { FormProvider, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";

import { ProductionJobFormSchema } from "@/types";

import Submit from "@/components/structures/Production/Submit";
import Drawer from "@/components/structures/Taxes/Drawer/Drawer";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

import { useProductionTaxesStore } from "@/store/useTaxStore";

const Inputs = dynamic(() => import("@/components/structures/Production/Inputs"), {
  ssr: false,
  loading: () => (
    <>
      <Stack orientation="vertical" classes="w-full">
        <Stack orientation="horizontal" wrap classes="w-full">
          <Skeleton classes="input-flex min-h-12 w-full" />
          <Skeleton classes="input-flex min-h-12 w-full" />
          <Skeleton classes="input-flex min-h-12 w-full" />
          <Skeleton classes="input-flex min-h-12 w-full" />
          <Skeleton classes="input-flex min-h-12 w-full" />
          <Skeleton classes="input-flex min-h-12 w-full" />
          <Skeleton classes="input-flex min-h-12 w-full" />
        </Stack>
        <Stack orientation="horizontal" classes="w-full">
          <Skeleton classes="h-5 w-full" />
          <Skeleton classes="h-5 w-full" />
        </Stack>
      </Stack>
    </>
  ),
});

function Form() {
  const { taxes, clearTaxes, setSaveTaxes, addTax, removeTax } = useProductionTaxesStore(
    (state) => state
  );

  const methods = useForm({
    resolver: zodResolver(ProductionJobFormSchema),
  });
  return (
    <>
      <FormProvider {...methods}>
        <Inputs />
        <Stack classes="my-8 w-full">
          <Drawer
            addTax={addTax}
            taxes={taxes}
            clearTaxes={clearTaxes}
            setSaveTaxes={setSaveTaxes}
            removeTax={removeTax}
          >
            <Button variant="black" classes="w-full">
              Advanced options
            </Button>
          </Drawer>
        </Stack>
        <Submit />
      </FormProvider>
    </>
  );
}

export default Form;

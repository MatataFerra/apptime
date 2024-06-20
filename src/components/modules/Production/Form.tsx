"use client";

import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";

import { ProductionJobFormSchema } from "@/types";

import Submit from "@/components/structures/Production/Submit";
import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

import useUser from "@/hooks/useUser";

import { useProductionTaxesStore } from "@/store/useTaxStore";

const AccordionTaxes = dynamic(() => import("@/components/structures/Taxes/AccordionTaxes"), {
  ssr: false,
  loading: () => (
    <Stack classes="w-full">
      <Skeleton classes="h-24 w-full" />
    </Stack>
  ),
});

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
  const { data: user, isLoading } = useUser();
  const { taxes, clearTaxes, setSaveTaxes, addTax, removeTax } = useProductionTaxesStore(
    (state) => state
  );

  const savedTaxesFromDB = useMemo(() => {
    if (!user?.config?.taxSaved?.productionTaxes) return [];

    return user?.config?.taxSaved?.productionTaxes;
  }, [user?.config?.taxSaved?.productionTaxes]);

  const methods = useForm({
    resolver: zodResolver(ProductionJobFormSchema),
  });
  return (
    <>
      <FormProvider {...methods}>
        <Inputs />
        <Stack classes="my-8 w-full">
          <AccordionTaxes
            isLoadingTaxes={isLoading}
            type="production"
            addTax={addTax}
            taxes={taxes}
            clearTaxes={clearTaxes}
            emptyTableText="Not taxes yet"
            setSaveTaxes={setSaveTaxes}
            removeTax={removeTax}
            taxesFromDB={savedTaxesFromDB}
          />
        </Stack>
        <Submit />
      </FormProvider>
    </>
  );
}

export default Form;

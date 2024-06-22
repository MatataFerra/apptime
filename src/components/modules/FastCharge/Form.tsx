"use client";

import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";

import { FastChargeFormSchema } from "@/types";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

import useSavedTax from "@/hooks/useSavedTax";
import useUser from "@/hooks/useUser";

import { useHourlyTaxesStore } from "@/store/useTaxStore";

const AccordionTaxes = dynamic(() => import("@/components/structures/Taxes/AccordionTaxes"), {
  ssr: false,
  loading: () => (
    <Stack classes="w-full">
      <Skeleton classes="h-24 w-full" />
    </Stack>
  ),
});

const Inputs = dynamic(() => import("@/components/structures/FastCharge/Inputs"), {
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

const Submit = dynamic(() => import("@/components/structures/FastCharge/Submit"), {
  ssr: false,
  loading: () => (
    <Stack justifyContent="end" classes="w-full">
      <Skeleton classes="h-12 w-32" />
    </Stack>
  ),
});

function Form() {
  const { data: user, isLoading } = useUser();
  const { addTax, clearTaxes, removeTax, setSaveTaxes, taxes } = useHourlyTaxesStore(
    (state) => state
  );
  const savedTaxesFromDB = useSavedTax(user, "hourly");

  const methods = useForm({
    resolver: zodResolver(FastChargeFormSchema),
  });

  return (
    <>
      <FormProvider {...methods}>
        <Inputs />
        <Stack classes="my-8 w-full">
          <AccordionTaxes
            isLoadingTaxes={isLoading}
            type="hourly"
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

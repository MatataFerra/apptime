"use client";

import { FormProvider, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";

import { FastChargeFormSchema } from "@/types";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

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
  const methods = useForm({
    resolver: zodResolver(FastChargeFormSchema),
  });
  return (
    <>
      <FormProvider {...methods}>
        <Inputs />
        <Submit />
      </FormProvider>
    </>
  );
}

export default Form;

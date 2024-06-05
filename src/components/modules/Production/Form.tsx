"use client";

import { FormProvider, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";

import { ProductionJobFormSchema } from "@/types";

import Submit from "@/components/structures/Production/Submit";
import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

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
  const methods = useForm({
    resolver: zodResolver(ProductionJobFormSchema),
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

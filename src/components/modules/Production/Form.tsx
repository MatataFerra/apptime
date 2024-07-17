"use client";

import { FormProvider, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";

import { ProductionJobFormSchema } from "@/types";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

const Drawer = dynamic(() => import("@/components/modules/Production/Drawer"), {
  ssr: false,
  loading: () => <Skeleton classes="h-12 w-full" />,
});

const Inputs = dynamic(() => import("@/components/structures/Production/Inputs"), {
  ssr: false,
  loading: () => (
    <>
      <Stack orientation="vertical" classes="w-full">
        <Stack orientation="horizontal" wrap classes="w-full">
          <Skeleton classes="min-h-16 w-full" />
          <Skeleton classes="min-h-16 w-full" />
          <Skeleton classes="input-flex min-h-16 w-full" />
          <Skeleton classes="input-flex min-h-16 w-full" />
          <Skeleton classes="input-flex min-h-16 w-full" />
        </Stack>
        <Stack orientation="horizontal" classes="w-full">
          <Skeleton classes="h-8 w-full" />
          <Skeleton classes="h-8 w-full" />
        </Stack>
      </Stack>
    </>
  ),
});

const Submit = dynamic(() => import("@/components/structures/Production/Submit"), {
  ssr: false,
  loading: () => (
    <Stack justifyContent="end" classes="w-full">
      <Skeleton classes="h-12 w-32" />
    </Stack>
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
        <Drawer />
        <Submit />
      </FormProvider>
    </>
  );
}

export default Form;

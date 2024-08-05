"use client";

import type { PropsWithChildren, ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { ProductionJobFormSchema } from "@/types";

interface Props {
  drawer: ReactNode;
  inputs: ReactNode;
}

export default function FormLayout({ drawer, inputs, children }: PropsWithChildren<Props>) {
  const methods = useForm({
    resolver: zodResolver(ProductionJobFormSchema),
  });
  return (
    <FormProvider {...methods}>
      {inputs}
      {drawer}
      {children}
    </FormProvider>
  );
}

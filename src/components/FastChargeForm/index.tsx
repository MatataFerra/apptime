"use client";

import dynamic from "next/dynamic";

import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

const FormReport = dynamic(() => import("@/components/FastChargeFormReport"), {
  ssr: false,
  loading: () => (
    <Stack orientation="vertical" classes="h-full w-full">
      <Skeleton classes="h-28 w-1/2" />
    </Stack>
  ),
});

const FastChargeFormInputs = dynamic(() => import("@/components/FastChargeFormInputs"), {
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

function FastChargeForm() {
  return (
    <>
      <FastChargeFormInputs />

      <FormReport />
      <Stack justifyContent="end" classes="w-full">
        <Button type="submit" variant="black" form="fast-charge">
          Submit
        </Button>
      </Stack>
    </>
  );
}

export default FastChargeForm;

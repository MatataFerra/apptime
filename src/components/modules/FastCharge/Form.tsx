"use client";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

const Report = dynamic(() => import("@/components/structures/FastCharge/Report"), {
  ssr: false,
  loading: () => (
    <Stack orientation="vertical" classes="h-full w-full">
      <Skeleton classes="h-28 w-1/2" />
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

const Submit = dynamic(() => import("@/components/structures/share/SubmitForm"), {
  ssr: false,
  loading: () => (
    <Stack justifyContent="end" classes="w-full">
      <Skeleton classes="h-12 w-32" />
    </Stack>
  ),
});

function Form() {
  return (
    <>
      <Inputs />
      <Report />
      <Submit form="fast-charge" />
    </>
  );
}

export default Form;

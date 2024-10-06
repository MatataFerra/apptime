"use client";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

const Inputs = dynamic(() => import("@/components/structures/FastCharge/Inputs"), {
  ssr: false,
  loading: () => (
    <>
      <Stack orientation="vertical" spacing={8} classes="min-h-[50dvh] w-full">
        <Stack orientation="horizontal" wrap classes="w-full">
          <div className="flex w-full gap-4">
            <Skeleton classes="min-h-14 w-full" />
          </div>
          <div className="flex w-full gap-4">
            <Skeleton classes="min-h-14 w-full" />
            <Skeleton classes="min-h-14 w-full" />
          </div>
          <div className="flex w-full gap-4">
            <Skeleton classes="min-h-14 w-full" />
            <Skeleton classes="min-h-14 w-full" />
          </div>
          <Skeleton classes="min-h-14 w-full" />
          <Skeleton classes="min-h-14 w-full" />
        </Stack>
        <Stack classes="min-h-10 w-full">
          <Skeleton classes="h-8" />
          <Skeleton classes="h-8" />
        </Stack>
      </Stack>
    </>
  ),
});

export default function InputsPage() {
  return <Inputs />;
}

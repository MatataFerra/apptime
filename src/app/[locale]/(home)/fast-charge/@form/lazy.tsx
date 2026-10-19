"use client";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

export const Submit = dynamic(() => import("@/components/structures/FastCharge/Submit"), {
  ssr: false,
  loading: () => (
    <Stack justifyContent="end" classes="w-full">
      <Skeleton classes="h-12 w-32" />
    </Stack>
  ),
});

"use client";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

export const CarouselChart = dynamic(() => import("@/components/modules/Dashboard/CarouselChart"), {
  ssr: false,
  loading: () => (
    <Stack classes="h-[500px] w-full overflow-hidden">
      <Skeleton classes="mx-auto mt-8 h-full w-full max-w-xl" />
    </Stack>
  ),
});

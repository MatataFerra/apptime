"use client";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

export const CarouselChart = dynamic(() => import("@/components/modules/Dashboard/CarouselChart"), {
  ssr: false,
  loading: () => (
    <Stack classes="h-full w-full overflow-hidden">
      <Skeleton classes="mx-auto mt-8 h-full w-full max-w-xl" />
    </Stack>
  ),
});
export const TableHistory = dynamic(() => import("@/components/modules/Dashboard/TableHistory"), {
  ssr: false,
  loading: () => (
    <Stack
      orientation="vertical"
      classes="h-fit max-h-60 min-h-60 w-full overflow-y-scroll rounded-lg border border-border bg-surface"
    >
      <Skeleton classes="h-full w-full" />
    </Stack>
  ),
});
export const PickupDate = dynamic(
  () => import("@/components/structures/Dashboard/Table/PickupDate"),
  {
    ssr: false,
    loading: () => (
      <Stack as="nav" alignItems="center">
        <Skeleton classes="h-10 w-60" />
        <Skeleton classes="h-10 w-32" />
      </Stack>
    ),
  }
);
export const DashboardProvider = dynamic(() => import("@/providers/DashboardProvider"), {
  ssr: false,
  loading: () => (
    <Stack classes="mx-auto mt-8 h-full w-full max-w-xl">
      <Skeleton classes="h-full w-full" />
    </Stack>
  ),
});

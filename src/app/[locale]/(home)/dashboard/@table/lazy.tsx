"use client";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

export const PickupDate = dynamic(
  () => import("@/components/structures/Dashboard/Table/PickupDate"),
  {
    ssr: false,
    loading: () => <Skeleton classes="h-10 w-2/6" />,
  }
);

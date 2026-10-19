"use client";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

export const MonitorScreen = dynamic(() => import("@/components/modules/Track/Monitor/Screen"), {
  ssr: false,
  loading: () => <Skeleton classes="h-monitor w-full rounded-3xl" />,
});
export const ShiftTools = dynamic(() => import("@/components/structures/Track/Fab"), {
  ssr: false,
});

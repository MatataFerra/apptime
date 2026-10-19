"use client";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

export const HomeHeader = dynamic(() => import("@/components/structures/Home/HomeHeader"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col gap-2 pt-2">
      <Skeleton classes="h-4 w-36" />
      <Skeleton classes="h-16 w-20" />
    </div>
  ),
});
export const WeekSummary = dynamic(() => import("@/components/structures/Home/WeekSummary"), {
  ssr: false,
  loading: () => <Skeleton classes="h-52 w-full rounded-2xl" />,
});
export const LiveShift = dynamic(() => import("@/components/structures/Home/LiveShift"), {
  ssr: false,
});
export const RepeatShift = dynamic(() => import("@/components/structures/Home/RepeatShift"), {
  ssr: false,
});

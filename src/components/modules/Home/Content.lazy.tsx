"use client";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

export const HomeHeader = dynamic(() => import("@/components/structures/Home/HomeHeader"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col gap-2 pt-2">
      <Skeleton classes="h-5 w-40" />
      <Skeleton classes="h-[4.5rem] w-24" />
    </div>
  ),
});
export const WeekSummary = dynamic(() => import("@/components/structures/Home/WeekSummary"), {
  ssr: false,
  loading: () => <Skeleton classes="h-80 w-full rounded-xl" />,
});
export const LiveShift = dynamic(() => import("@/components/structures/Home/LiveShift"), {
  ssr: false,
});
export const RepeatFastCharge = dynamic(
  () => import("@/components/structures/Home/RepeatFastCharge"),
  { ssr: false }
);
export const EarningsGoal = dynamic(() => import("@/components/structures/Home/EarningsGoal"), {
  ssr: false,
});

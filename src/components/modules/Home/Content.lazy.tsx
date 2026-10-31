"use client";

import dynamic from "next/dynamic";

// HomeHeader and WeekSummary are server components (Content.tsx): they're
// in the first HTML instead of waiting for these chunks.
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

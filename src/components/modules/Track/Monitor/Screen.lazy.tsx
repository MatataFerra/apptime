"use client";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

export const Tracker = dynamic(() => import("@/components/modules/Track/Monitor/Tracker"), {
  ssr: false,
  loading: () => (
    <div className="flex size-full flex-col justify-between gap-6">
      <Skeleton classes="h-5 w-28 bg-ink-inverse/10" />
      <Skeleton classes="h-20 w-48 bg-ink-inverse/10" />
      <Skeleton classes="h-12 w-full bg-ink-inverse/10" />
    </div>
  ),
});

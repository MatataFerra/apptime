"use client";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

export const Insights = dynamic(() => import("@/components/structures/Dashboard/Insights"), {
  ssr: false,
  loading: () => <Skeleton classes="h-72 w-full rounded-[20px]" />,
});

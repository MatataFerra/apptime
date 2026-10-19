"use client";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

export const HistoryList = dynamic(() => import("@/components/structures/Dashboard/History/List"), {
  ssr: false,
  loading: () => <Skeleton classes="h-72 w-full rounded-[20px]" />,
});

"use client";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

export const HomeCardOption = dynamic(() => import("@/components/ui/OptionCard"), {
  ssr: false,
  loading: () => <Skeleton classes="m-3 h-10" />,
});
export const MonthEarned = dynamic(() => import("@/components/structures/Home/MonthEarned"), {
  ssr: false,
});

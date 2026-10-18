"use client";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

export const Content = dynamic(() => import("@/components/structures/Dashboard/Chart/Content"), {
  ssr: false,
  loading: () => <Skeleton classes="mx-auto mt-8 h-full w-full" />,
});

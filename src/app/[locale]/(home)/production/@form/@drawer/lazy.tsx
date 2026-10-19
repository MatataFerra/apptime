"use client";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

export const Drawer = dynamic(() => import("@/components/modules/Production/Drawer"), {
  ssr: false,
  loading: () => <Skeleton classes="h-12 w-full" />,
});

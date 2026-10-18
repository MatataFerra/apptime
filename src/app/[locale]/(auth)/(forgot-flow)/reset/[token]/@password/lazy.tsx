"use client";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

export const Form = dynamic(() => import("@/components/structures/Reset/Form"), {
  ssr: false,
  loading: () => (
    <>
      <div className="flex h-full w-full flex-col">
        <Skeleton classes="h-18 w-full" />
        <Skeleton classes="h-18 w-full" />
        <Skeleton classes="h-full w-full" />
      </div>
    </>
  ),
});

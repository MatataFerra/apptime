"use client";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

export const EmailForm = dynamic(() => import("@/components/structures/Reset/Email/Form"), {
  ssr: false,
  loading: () => (
    <>
      <div className="flex h-full w-full flex-col">
        <Skeleton classes="h-18 w-full" />
      </div>
    </>
  ),
});

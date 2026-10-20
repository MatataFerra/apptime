"use client";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

export const TaxList = dynamic(() => import("@/components/structures/Taxes/TaxList"), {
  ssr: false,
  loading: () => <Skeleton classes="h-48 w-full rounded-xl" />,
});

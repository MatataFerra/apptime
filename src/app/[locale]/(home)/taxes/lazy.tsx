"use client";

import dynamic from "next/dynamic";

import TaxListSkeleton from "@/components/structures/Taxes/TaxListSkeleton";

export const TaxList = dynamic(() => import("@/components/structures/Taxes/TaxList"), {
  ssr: false,
  loading: () => <TaxListSkeleton />,
});

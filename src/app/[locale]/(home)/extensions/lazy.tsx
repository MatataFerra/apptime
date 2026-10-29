"use client";

import dynamic from "next/dynamic";

import VisaReportSkeleton from "@/components/structures/Extensions/VisaReportSkeleton";

export const VisaReport = dynamic(() => import("@/components/structures/Extensions/VisaReport"), {
  ssr: false,
  loading: () => <VisaReportSkeleton />,
});

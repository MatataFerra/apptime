"use client";

import dynamic from "next/dynamic";

import { SubmitSkeleton } from "@/components/structures/share/FormSkeleton";

export const Submit = dynamic(() => import("@/components/structures/FastCharge/Submit"), {
  ssr: false,
  loading: () => <SubmitSkeleton />,
});

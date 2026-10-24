"use client";

import type { ReactNode } from "react";

import dynamic from "next/dynamic";

import BatchModes from "@/components/structures/share/batch/BatchModes";
import Skeleton from "@/components/ui/Skeleton";

const Batch = dynamic(() => import("@/components/structures/FastCharge/Batch"), {
  ssr: false,
  loading: () => <Skeleton classes="min-h-[50dvh] w-full" />,
});

/** Fast charge: one shift, or the same shift over several days. */
function Modes({ single }: { single: ReactNode }) {
  return <BatchModes single={single} batch={<Batch />} />;
}

export default Modes;

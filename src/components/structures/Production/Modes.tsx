"use client";

import type { ReactNode } from "react";

import dynamic from "next/dynamic";

import { BatchSkeleton } from "@/components/structures/Production/Skeletons";
import BatchModes from "@/components/structures/share/batch/BatchModes";

const Batch = dynamic(() => import("@/components/structures/Production/Batch"), {
  ssr: false,
  loading: () => <BatchSkeleton />,
});

/** Production: one shift, or the same shift over several days. */
function Modes({ single }: { single: ReactNode }) {
  return <BatchModes single={single} batch={<Batch />} />;
}

export default Modes;

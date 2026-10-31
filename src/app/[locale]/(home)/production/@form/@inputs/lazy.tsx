"use client";

import dynamic from "next/dynamic";

import { InputsSkeleton } from "@/components/structures/Production/Skeletons";

export const Inputs = dynamic(() => import("@/components/structures/Production/Inputs"), {
  ssr: false,
  loading: () => <InputsSkeleton />,
});

"use client";

import dynamic from "next/dynamic";

import { InputsSkeleton } from "@/components/structures/FastCharge/Skeletons";

const Inputs = dynamic(() => import("@/components/structures/FastCharge/Inputs"), {
  ssr: false,
  loading: () => <InputsSkeleton />,
});

export default function InputsPage() {
  return <Inputs />;
}

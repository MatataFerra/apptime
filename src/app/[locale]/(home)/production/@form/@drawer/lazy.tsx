"use client";

import dynamic from "next/dynamic";

import { TaxesSkeleton } from "@/components/structures/share/FormSkeleton";

export const Drawer = dynamic(() => import("@/components/modules/Production/Drawer"), {
  ssr: false,
  loading: () => <TaxesSkeleton />,
});

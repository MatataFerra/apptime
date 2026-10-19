"use client";

import dynamic from "next/dynamic";

export const Toaster = dynamic(() => import("@/components/ui/Toast/toaster"), {
  ssr: false,
});

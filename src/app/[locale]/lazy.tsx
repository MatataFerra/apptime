"use client";

import dynamic from "next/dynamic";

export const Providers = dynamic(() => import("@/providers/Providers"), {
  ssr: false,
});
export const Toaster = dynamic(() => import("@/components/ui/Toast/toaster"), {
  ssr: false,
});

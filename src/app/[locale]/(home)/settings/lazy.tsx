"use client";

import dynamic from "next/dynamic";

export const SaveBar = dynamic(() => import("@/components/structures/Settings/SaveBar"), {
  ssr: false,
});
export const DataSection = dynamic(
  () => import("@/components/structures/Settings/Preferences/DataSection"),
  { ssr: false }
);

export const SecuritySection = dynamic(
  () => import("@/components/structures/Settings/Security/SecuritySection"),
  { ssr: false }
);

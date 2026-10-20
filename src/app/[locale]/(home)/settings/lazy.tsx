"use client";

import dynamic from "next/dynamic";

export const DataSection = dynamic(
  () => import("@/components/structures/Settings/Preferences/DataSection"),
  { ssr: false }
);

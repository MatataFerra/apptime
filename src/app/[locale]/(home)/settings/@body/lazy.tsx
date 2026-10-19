"use client";

import dynamic from "next/dynamic";

export const ProfileCard = dynamic(() => import("@/components/structures/Settings/ProfileCard"), {
  ssr: false,
});

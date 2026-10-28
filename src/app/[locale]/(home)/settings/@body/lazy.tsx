"use client";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

export const ProfileCard = dynamic(() => import("@/components/structures/Settings/ProfileCard"), {
  ssr: false,
});

export const AppearanceSection = dynamic(
  () => import("@/components/structures/Settings/Preferences/AppearanceSection"),
  { ssr: false, loading: () => <Skeleton classes="h-40 w-full rounded-xl" /> }
);
export const WorkSection = dynamic(
  () => import("@/components/structures/Settings/Preferences/WorkSection"),
  { ssr: false, loading: () => <Skeleton classes="h-56 w-full rounded-xl" /> }
);
export const GoalSection = dynamic(
  () => import("@/components/structures/Settings/Preferences/GoalSection"),
  { ssr: false, loading: () => <Skeleton classes="h-40 w-full rounded-xl" /> }
);
export const MoneySection = dynamic(
  () => import("@/components/structures/Settings/Preferences/MoneySection"),
  { ssr: false, loading: () => <Skeleton classes="h-72 w-full rounded-xl" /> }
);

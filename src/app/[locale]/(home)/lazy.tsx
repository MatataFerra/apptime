"use client";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

export const SheetHamMenu = dynamic(
  () => import("@/components/modules/SheetHamMenu/SheetHamMenu"),
  {
    ssr: false,
  }
);
export const Header = dynamic(() => import("@/components/ui/Header"), {
  ssr: false,
  loading: () => (
    <Stack orientation="horizontal">
      <Skeleton classes="size-10" />
      <Skeleton classes="h-6 w-28" />
    </Stack>
  ),
});

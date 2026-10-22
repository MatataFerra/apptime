"use client";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

export const EmployerList = dynamic(
  () => import("@/components/structures/Employers/EmployerList"),
  {
    ssr: false,
    loading: () => <Skeleton classes="h-48 w-full rounded-xl" />,
  }
);

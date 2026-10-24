"use client";

import dynamic from "next/dynamic";

import EmployerListSkeleton from "@/components/structures/Employers/EmployerListSkeleton";

export const EmployerList = dynamic(
  () => import("@/components/structures/Employers/EmployerList"),
  {
    ssr: false,
    loading: () => <EmployerListSkeleton />,
  }
);

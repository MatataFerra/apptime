"use client";

import { type PropsWithChildren, useEffect } from "react";

import useDashboard from "@/hooks/useDashboard";

export default function Template({ children }: PropsWithChildren) {
  const { resetShifts, refetch } = useDashboard();

  useEffect(() => {
    return () => {
      resetShifts();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);
  return <>{children}</>;
}

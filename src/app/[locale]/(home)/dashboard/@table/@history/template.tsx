"use client";

import { type PropsWithChildren, useEffect } from "react";

import { useDashHourlyStore } from "@/store/useDashHourlyStore";
import { useDashProductionStore } from "@/store/useDashProductionStore";

export default function Template({ children }: PropsWithChildren) {
  const { reset: resetProduction } = useDashProductionStore();
  const { reset: resetHourly } = useDashHourlyStore();

  useEffect(() => {
    return () => {
      resetProduction();
      resetHourly();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}

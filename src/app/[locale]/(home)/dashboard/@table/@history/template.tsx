"use client";

import { type PropsWithChildren, useEffect } from "react";

import { useDashHourlyStore } from "@/store/useDashHourlyStore";
import { useDashProductionStore } from "@/store/useDashProductionStore";
import { useHistorySelection } from "@/store/useHistorySelection";

export default function Template({ children }: PropsWithChildren) {
  const { reset: resetProduction } = useDashProductionStore();
  const { reset: resetHourly } = useDashHourlyStore();
  const stopSelecting = useHistorySelection((state) => state.stop);

  useEffect(() => {
    return () => {
      resetProduction();
      resetHourly();
      stopSelecting();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}

"use client";

import type { ReactNode } from "react";

import Hydrate from "@/components/ui/Hydrate";

import { type ShiftState, useTrackStore } from "@/hooks/useTrack";

function HydrateStore({ data, children }: { data: Partial<ShiftState>; children: ReactNode }) {
  return (
    <Hydrate data={data} store={useTrackStore}>
      {children}
    </Hydrate>
  );
}

export default HydrateStore;

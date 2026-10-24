"use client";

import type { ReactNode } from "react";

import Hydrate from "@/components/ui/Hydrate";

import { type ShiftState, useTrackStore } from "@/hooks/useTrack";

function HydrateStore({
  data,
  ready,
  children,
}: {
  data: Partial<ShiftState>;
  ready?: boolean;
  children: ReactNode;
}) {
  return (
    <Hydrate data={data} ready={ready} store={useTrackStore}>
      {children}
    </Hydrate>
  );
}

export default HydrateStore;

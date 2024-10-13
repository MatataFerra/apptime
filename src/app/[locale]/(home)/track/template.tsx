"use client";

import { type PropsWithChildren } from "react";

import HydrateStore from "@/components/structures/Track/HydrateStore";

import useHourlyShifts from "@/hooks/useHourlyShifts";

export default function Template({ children }: PropsWithChildren) {
  const { data: shifts } = useHourlyShifts();

  return <HydrateStore data={{ shifts }}>{children}</HydrateStore>;
}

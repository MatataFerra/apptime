"use client";

import { type PropsWithChildren, useEffect, useState } from "react";

import isEqual from "lodash/isEqual";

import type { HourlyType } from "@/types";

import HydrateStore from "@/components/structures/Track/HydrateStore";

import useHourlyShifts from "@/hooks/useHourlyShifts";

export default function Template({ children }: PropsWithChildren) {
  const { data: shifts } = useHourlyShifts();

  const [freshData, setFreshData] = useState<HourlyType[]>(shifts);

  useEffect(() => {
    if (isEqual(shifts, freshData)) return;

    setFreshData(shifts);
  }, [freshData, shifts]);

  return <HydrateStore data={{ shifts: freshData }}>{children}</HydrateStore>;
}

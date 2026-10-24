"use client";

import { type PropsWithChildren, useMemo } from "react";

import type { UserType } from "@/types";

import HydrateStore from "@/components/structures/Track/HydrateStore";

import useHourlyShifts from "@/hooks/useHourlyShifts";
import useProductionShifts from "@/hooks/useProductionShifts";
import useUser from "@/hooks/useUser";

/**
 * Track reads its shifts from the same hourly/production queries as Home
 * (the ones every start, finish and edit invalidates), not from the
 * user's embedded copy: that one can be stale or missing, which left Track
 * "off the clock" while Home showed the running shift.
 */
export default function Template({ children }: PropsWithChildren) {
  const { data: user } = useUser();
  const { data: hourly, isFetched: hourlyFetched } = useHourlyShifts();
  const { data: production, isFetched: productionFetched } = useProductionShifts();

  const merged = useMemo(() => {
    if (!user && !hourly && !production) return undefined;

    return {
      ...user,
      shifts: {
        ...user?.shifts,
        hourly: hourly ?? user?.shifts?.hourly ?? [],
        production: production ?? user?.shifts?.production ?? [],
      },
    } as UserType;
  }, [user, hourly, production]);

  // Once both lists are in, hydrate even if they're empty, so a user with
  // no shifts (or whose user request failed) gets the idle monitor, not a
  // skeleton forever.
  return (
    <HydrateStore data={{ user: merged }} ready={hourlyFetched && productionFetched}>
      {children}
    </HydrateStore>
  );
}

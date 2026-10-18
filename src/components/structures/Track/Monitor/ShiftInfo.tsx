"use client";

import { useMemo } from "react";

import DateHumanizer from "@/services/Date";
import ShiftService from "@/services/Shift";

import useTrack from "@/hooks/useTrack";

function ShiftTrackInfo() {
  const {
    user: getUser,
    shiftUnclosed: { isLoading },
  } = useTrack();

  const hourly = useMemo(() => getUser?.shifts?.hourly ?? [], [getUser?.shifts?.hourly]);
  const lastShift = hourly.at(-1);

  const dateHumanized = useMemo(
    () => new DateHumanizer("long").humanizeDate(new Date(lastShift?.startDate ?? "")),
    [lastShift?.startDate]
  );

  const earnings = useMemo(
    () =>
      hourly.reduce((acc, shift) => {
        if (shift.isClosed) {
          acc += new ShiftService(shift).calculateEarnings();
        }

        return acc;
      }, 0),
    [hourly]
  );

  if (hourly.length === 0) return null;

  return (
    <dl className="grid grid-cols-2 gap-4 border-t border-ink-inverse/15 pt-4">
      <div className="flex flex-col gap-0.5">
        <dt className="text-xs text-ink-inverse/60">Last shift</dt>
        <dd className="text-sm font-medium">
          {isLoading ? "…" : (dateHumanized ?? "No date yet")}
        </dd>
      </div>
      <div className="flex flex-col gap-0.5">
        <dt className="text-xs text-ink-inverse/60">Earned so far</dt>
        <dd className="figure text-xl font-semibold text-live">
          {isLoading ? "…" : `$${earnings?.toFixed(2)}`}
        </dd>
      </div>
    </dl>
  );
}

export default ShiftTrackInfo;

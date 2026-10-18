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

  const lastShift = useMemo(() => getUser?.shifts?.hourly.at(-1), [getUser?.shifts?.hourly]);

  const dateHumanized = useMemo(
    () => new DateHumanizer("long").humanizeDate(new Date(lastShift?.startDate ?? "")),
    [lastShift?.startDate]
  );

  const earnings = useMemo(
    () =>
      getUser?.shifts?.hourly.reduce((acc, shift) => {
        if (shift.isClosed) {
          acc += new ShiftService(shift).calculateEarnings();
        }

        return acc;
      }, 0),
    [getUser?.shifts?.hourly]
  );

  if (getUser?.shifts?.hourly.length === 0) return null;

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

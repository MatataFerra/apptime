"use client";

import { useEffect, useState } from "react";

import isEmpty from "lodash/isEmpty";
import { useInterval } from "usehooks-ts";

import ShiftService from "@/services/Shift";

import useTrack from "@/hooks/useTrack";

type Elapsed = { hours: number; minutes: number } | null;

function elapsed(start?: string | null, end?: string | null): Elapsed {
  if (!start) return null;
  const { diff } = ShiftService.differenceInHHmm(start, end ?? "");
  return { hours: Math.floor(diff / 60), minutes: diff % 60 };
}

function ShiftState() {
  const { shiftUnclosed, isShiftActive } = useTrack();
  const [time, setTime] = useState<Elapsed>(null);

  useEffect(() => {
    setTime(elapsed(shiftUnclosed.shift?.startDate, shiftUnclosed.shift?.endDate));
  }, [shiftUnclosed.shift?.endDate, shiftUnclosed.shift?.startDate]);

  useInterval(() => {
    setTime(
      isShiftActive
        ? elapsed(shiftUnclosed.shift?.startDate, shiftUnclosed.shift?.endDate)
        : { hours: 0, minutes: 0 }
    );
  }, 5000);

  if (shiftUnclosed.isLoading) {
    return <p className="figure text-figure text-ink-inverse/30">–</p>;
  }

  if (isEmpty(shiftUnclosed.shift)) {
    return <p className="text-lg text-ink-inverse/70">No shift is being tracked</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="figure text-figure text-ink-inverse" aria-live="polite">
        {time ? (
          <>
            {time.hours}
            <span className="mr-[0.25em] ml-[0.05em] text-[0.45em] text-ink-inverse/60">h</span>
            {String(time.minutes).padStart(2, "0")}
            <span className="ml-[0.05em] text-[0.45em] text-ink-inverse/60">m</span>
          </>
        ) : (
          "–"
        )}
      </p>
      {shiftUnclosed.shift?.name ? (
        <p className="truncate text-sm text-ink-inverse/70">{shiftUnclosed.shift.name}</p>
      ) : null}
    </div>
  );
}

export default ShiftState;

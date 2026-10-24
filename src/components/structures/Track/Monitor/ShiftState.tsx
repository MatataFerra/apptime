"use client";

import { useState } from "react";

import isEmpty from "lodash/isEmpty";
import { useTranslations } from "next-intl";
import { useInterval } from "usehooks-ts";

import ShiftService from "@/services/Shift";

import useTrack from "@/hooks/useTrack";

function elapsedMinutes(start?: string | null) {
  if (!start) return 0;
  return ShiftService.differenceInHHmm(start, "").diff;
}

/** Elapsed time of the running shift, as the monitor's headline. */
function ShiftState() {
  const { shiftUnclosed } = useTrack();
  const t = useTranslations("track.monitor");
  const tl = useTranslations("home.live");
  const start = shiftUnclosed.shift?.startDate;
  const [minutes, setMinutes] = useState(() => elapsedMinutes(start));

  useInterval(() => setMinutes(elapsedMinutes(start)), 5000);

  if (shiftUnclosed.isLoading) {
    return <p className="figure text-[5.25rem] leading-[0.9] text-ink-inverse/25">–</p>;
  }

  if (isEmpty(shiftUnclosed.shift)) {
    return <p className="text-lg text-ink-inverse/70">{t("none_tracked")}</p>;
  }

  const current = elapsedMinutes(start) || minutes;
  const hours = Math.floor(current / 60);
  const mins = current % 60;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="truncate text-sm text-ink-inverse/70">
        {shiftUnclosed.shift?.name || tl("hourly_shift")}
      </span>
      <p
        className="figure text-[5.25rem] leading-[0.9] text-ink-inverse"
        aria-label={t("elapsed", { hours, mins })}
      >
        {hours}
        <span className="mr-[0.2em] text-[0.48em] text-ink-inverse/55">h</span>
        {String(mins).padStart(2, "0")}
        <span className="text-[0.48em] text-ink-inverse/55">m</span>
      </p>
    </div>
  );
}

export default ShiftState;

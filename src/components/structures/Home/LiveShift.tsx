"use client";

import { useState } from "react";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useInterval } from "usehooks-ts";

import { formatMoney, runningShiftEarnings } from "@/services/Summary";

import { PATH_NAMES } from "@/utils/constants/pathnames";
import useHourlyShifts from "@/hooks/useHourlyShifts";

function elapsed(start: Date, now: Date) {
  const minutes = Math.max(0, Math.floor((now.valueOf() - start.valueOf()) / 60000));
  return { hours: Math.floor(minutes / 60), mins: minutes % 60 };
}

/**
 * Shown on Home only while a tracked shift is running, so it's obvious
 * the clock is on and one tap gets you back to it.
 */
function LiveShift() {
  const { data: hourly } = useHourlyShifts();
  const [now, setNow] = useState(() => new Date());
  const running = hourly?.find((shift) => !shift.isClosed);

  useInterval(() => setNow(new Date()), running ? 15000 : null);

  if (!running?.startDate) return null;

  const start = new Date(running.startDate);
  if (isNaN(start.valueOf())) return null;

  const { hours, mins } = elapsed(start, now);
  const earned = runningShiftEarnings(running, now);
  const startedAt = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <Link
      href={PATH_NAMES.TRACK}
      data-testid="live-shift"
      aria-label={`Shift in progress, ${hours} hours ${mins} minutes. Open Track`}
      className="group flex items-center gap-3.5 rounded-[20px] bg-track py-3.5 pr-3 pl-4 text-white shadow-float transition-transform active:scale-[0.98]"
    >
      <span className="relative flex size-2.5 shrink-0" aria-hidden="true">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-live opacity-70 motion-reduce:animate-none" />
        <span className="relative inline-flex size-2.5 rounded-full bg-live" />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[0.8125rem] font-medium text-white/75">
          On the clock since {startedAt}
        </span>
        <span className="flex items-baseline gap-2.5">
          <span className="figure text-[1.75rem] leading-none">
            {hours}
            <span className="mr-[0.15em] text-[0.6em] text-white/60">h</span>
            {String(mins).padStart(2, "0")}
            <span className="text-[0.6em] text-white/60">m</span>
          </span>
          <span className="truncate text-sm text-white/80">
            {earned > 0 ? `${formatMoney(earned)} so far` : running.name || "Hourly shift"}
          </span>
        </span>
      </span>

      <span className="flex h-9 shrink-0 items-center gap-0.5 rounded-full bg-white/15 pr-2 pl-3 text-sm font-semibold transition-colors group-hover:bg-white/25">
        Open
        <ChevronRight className="size-4" aria-hidden="true" />
      </span>
    </Link>
  );
}

export default LiveShift;

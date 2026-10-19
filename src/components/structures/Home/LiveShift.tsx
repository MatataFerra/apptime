"use client";

import { useState } from "react";

import { ChevronRight, Square } from "lucide-react";
import Link from "next/link";
import { useInterval } from "usehooks-ts";

import { formatMoney, runningShiftEarnings } from "@/services/Summary";

import { PATH_NAMES } from "@/utils/constants/pathnames";
import useFinishShift from "@/hooks/useFinishShift";
import useHourlyShifts from "@/hooks/useHourlyShifts";

function elapsed(start: Date, now: Date) {
  const minutes = Math.max(0, Math.floor((now.valueOf() - start.valueOf()) / 60000));
  return { hours: Math.floor(minutes / 60), mins: minutes % 60 };
}

/**
 * Shown on Home only while a tracked shift is running: how long it's been,
 * what it's worth so far, and a way to finish it without opening Track.
 */
function LiveShift() {
  const { data: hourly } = useHourlyShifts();
  const { finish, finishing } = useFinishShift();
  const [now, setNow] = useState(() => new Date());
  const [confirming, setConfirming] = useState(false);
  const running = hourly?.find((shift) => !shift.isClosed);

  useInterval(() => setNow(new Date()), running ? 15000 : null);
  // The confirmation step closes itself if it isn't used.
  useInterval(() => setConfirming(false), confirming ? 4000 : null);

  if (!running?.startDate) return null;

  const start = new Date(running.startDate);
  if (isNaN(start.valueOf())) return null;

  const { hours, mins } = elapsed(start, now);
  const earned = runningShiftEarnings(running, now);
  const startedAt = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <section
      data-testid="live-shift"
      aria-label="Shift in progress"
      className="flex flex-col gap-3 rounded-[20px] bg-track p-4 text-white shadow-float"
    >
      <Link
        href={PATH_NAMES.TRACK}
        aria-label={`Shift in progress, ${hours} hours ${mins} minutes. Open Track`}
        className="group flex items-center gap-3.5 rounded-xl"
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

        <ChevronRight
          className="size-5 shrink-0 text-white/70 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>

      {confirming ? (
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Finish this shift?">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="h-11 rounded-xl bg-white/15 text-sm font-semibold transition-colors hover:bg-white/25"
          >
            Keep going
          </button>
          <button
            type="button"
            disabled={finishing}
            onClick={async () => {
              await finish(running);
              setConfirming(false);
            }}
            className="h-11 rounded-xl bg-white text-sm font-semibold text-track-ink transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {finishing
              ? "Finishing…"
              : `Finish at ${now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setNow(new Date());
            setConfirming(true);
          }}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-white/15 text-sm font-semibold transition-colors hover:bg-white/25"
        >
          <Square className="size-3.5 fill-current" aria-hidden="true" />
          Finish shift
        </button>
      )}
    </section>
  );
}

export default LiveShift;

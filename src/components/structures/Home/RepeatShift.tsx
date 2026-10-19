"use client";

import { useState } from "react";

import { format } from "date-fns";
import { RotateCcw, X } from "lucide-react";
import Link from "next/link";

import { formatMoney } from "@/services/Summary";
import { planRepeat } from "@/services/Summary/repeat";

import { PATH_NAMES } from "@/utils/constants/pathnames";
import useHourlyShifts from "@/hooks/useHourlyShifts";

const DISMISSED_KEY = "repeat-shift-dismissed";

function readDismissed() {
  try {
    return window.localStorage.getItem(DISMISSED_KEY);
  } catch {
    return null;
  }
}

function clock(date: string, time: string) {
  return format(new Date(`${date}T${time}`), "h:mm a");
}

/**
 * "Same as last time?" — a shortcut to Fast charge with the last shift's
 * details moved to today. Shows up 24h after that shift started.
 */
function RepeatShift() {
  const { data: hourly } = useHourlyShifts();
  const [dismissed, setDismissed] = useState(readDismissed);
  const plan = planRepeat(hourly);

  if (!plan || dismissed === String(plan.source.id)) return null;

  const { source } = plan;
  const day = format(new Date(source.startDate), "EEEE");

  function dismiss() {
    try {
      window.localStorage.setItem(DISMISSED_KEY, String(source.id));
    } catch {
      // Private mode: it just comes back next visit.
    }
    setDismissed(String(source.id));
  }

  return (
    <section
      aria-label="Repeat your last shift"
      data-testid="repeat-shift"
      className="relative flex w-full min-w-0 flex-col gap-3 rounded-[20px] bg-fast-soft p-4 text-fast-ink"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Hide this suggestion"
        className="absolute top-2.5 right-2.5 flex size-8 items-center justify-center rounded-full text-fast-ink/60 hover:bg-fast-ink/10"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
      <div className="flex min-w-0 items-start gap-3 pr-8">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-fast text-white">
          <RotateCcw className="size-5" strokeWidth={2} aria-hidden="true" />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-[0.9375rem] font-semibold">Same shift as {day}?</h2>
          <p className="truncate text-[0.8125rem] text-fast-ink/80">
            {source.name || "Hourly shift"}
          </p>
          <p className="text-[0.8125rem] text-fast-ink/80 tabular-nums">
            {clock(plan.startDate, plan.startTime)} to {clock(plan.finishDate, plan.finishTime)} ·{" "}
            {formatMoney(source.hourValue)}/h
          </p>
        </div>
      </div>
      <Link
        href={`${PATH_NAMES.FAST_CHARGE}?repeat=${source.id}`}
        className="flex h-11 items-center justify-center rounded-xl bg-fast-ink text-[0.9375rem] font-semibold text-white transition-transform active:scale-[0.98]"
      >
        Log it for today
      </Link>
    </section>
  );
}

export default RepeatShift;

"use client";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

import useTrack from "@/hooks/useTrack";

const ShiftState = dynamic(() => import("@/components/structures/Track/Monitor/ShiftState"), {
  ssr: false,
  loading: () => <Skeleton classes="h-16 w-48 bg-ink-inverse/10" />,
});

const ShiftInfo = dynamic(() => import("@/components/structures/Track/Monitor/ShiftInfo"), {
  ssr: false,
});

function Tracker() {
  const {
    isShiftActive,
    isClosing,
    shiftUnclosed: { isLoading },
  } = useTrack();

  if (isLoading) {
    return <Skeleton classes="absolute inset-0 size-full rounded-none bg-ink-inverse/5" />;
  }

  const running = isShiftActive && !isClosing;

  return (
    <>
      <div className="flex items-center gap-2 text-sm text-ink-inverse/70">
        <span
          aria-hidden="true"
          className={
            running
              ? "size-2 rounded-full bg-live shadow-[0_0_0_4px_rgb(19_239_160/0.18)] motion-safe:animate-pulse"
              : "size-2 rounded-full bg-ink-inverse/30"
          }
        />
        {running ? "On the clock" : "Off the clock"}
      </div>

      {running ? (
        <ShiftState />
      ) : (
        <div className="flex flex-col gap-2">
          <p className="figure text-figure text-ink-inverse/30" aria-label="0 hours 0 minutes">
            0<span className="mr-[0.25em] ml-[0.05em] text-[0.45em]">h</span>00
            <span className="ml-[0.05em] text-[0.45em]">m</span>
          </p>
          <p className="max-w-[28ch] text-sm text-ink-inverse/70">
            No shift running. Press Start shift when you clock in.
          </p>
        </div>
      )}

      <ShiftInfo />
    </>
  );
}

export default Tracker;

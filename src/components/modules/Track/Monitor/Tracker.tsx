"use client";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

import useTrack from "@/hooks/useTrack";

const ShiftState = dynamic(() => import("@/components/structures/Track/Monitor/ShiftState"), {
  ssr: false,
  loading: () => <Skeleton classes="h-20 w-48 bg-ink-inverse/10" />,
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
      {running ? (
        <ShiftState />
      ) : (
        <div className="flex flex-col gap-2">
          <span className="text-sm text-ink-inverse/70">Off the clock</span>
          <p
            className="figure text-[5.25rem] leading-[0.9] text-ink-inverse/25"
            aria-label="0 hours 0 minutes"
          >
            0<span className="mr-[0.2em] text-[0.48em]">h</span>00
            <span className="text-[0.48em]">m</span>
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

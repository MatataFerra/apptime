"use client";

import dynamic from "next/dynamic";

import Image from "@/components/ui/Image";
import Skeleton from "@/components/ui/Skeleton";

import useHourlyShifts from "@/hooks/useHourlyShifts";
import useTrack from "@/hooks/useTrack";

const ShiftState = dynamic(() => import("@/components/structures/Track/Monitor/ShiftState"), {
  ssr: false,
  loading: () => <Skeleton classes="h-10 w-3/4" />,
});

const ShiftInfo = dynamic(() => import("@/components/structures/Track/Monitor/ShiftInfo"), {
  ssr: false,
});

function Tracker() {
  const { isLoading } = useHourlyShifts();
  const { isShiftActive, isClosing } = useTrack();

  return (
    <>
      {isLoading ? (
        <Skeleton classes="absolute inset-0 size-full" />
      ) : (
        <>
          {isShiftActive && !isClosing ? (
            <>
              <ShiftState />
              <ShiftInfo />
            </>
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-4 text-center">
              <Image
                src="/assets/clock_non_shifts.webp"
                alt="Clock lay down shown when there is no shift open"
                width={150}
                height={150}
                classes="aspect-square size-auto"
                priority
              />

              <h1 className="text-2xl font-bold text-gray-800">No shift has started</h1>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default Tracker;

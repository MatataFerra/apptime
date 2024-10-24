"use client";

import isEmpty from "lodash/isEmpty";
import dynamic from "next/dynamic";

import Image from "@/components/ui/Image";
import Skeleton from "@/components/ui/Skeleton";

import useTrackShift from "@/hooks/useTrackShift";

const ShiftState = dynamic(() => import("@/components/structures/Track/Monitor/ShiftState"), {
  ssr: false,
  loading: () => <Skeleton classes="h-10 w-3/4" />,
});

const ShiftInfo = dynamic(() => import("@/components/structures/Track/Monitor/ShiftInfo"), {
  ssr: false,
});

function Tracker() {
  const { data } = useTrackShift();
  console.log("🚀 ~ Tracker ~ data:", data);

  return (
    <>
      {!isEmpty(data?.shift) ? (
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
  );
}

export default Tracker;

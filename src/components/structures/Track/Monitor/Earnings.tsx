"use client";

import Skeleton from "@/components/ui/Skeleton";
import Text from "@/components/ui/Text";

import useTrackShift from "@/hooks/useTrackShift";

function Earnings() {
  const { data, isLoading } = useTrackShift();

  return (
    <>
      {isLoading ? (
        <Skeleton classes="h-8 w-full" />
      ) : (
        <Text classes="text-xl">Money earn at the moment: {`${data.earnings?.toFixed(2)}`}$</Text>
      )}
    </>
  );
}

export default Earnings;

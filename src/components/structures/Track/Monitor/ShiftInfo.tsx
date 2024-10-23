"use client";

import isEmpty from "lodash/isEmpty";

import DateHumanizer from "@/services/Date";

import Earnings from "@/components/structures/Track/Monitor/Earnings";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import useTrackShift from "@/hooks/useTrackShift";

function ShiftTrackInfo() {
  const { data, isLoading } = useTrackShift();

  const dateHumanized = new DateHumanizer("long").humanizeDate(
    new Date(data?.last?.startDate ?? "")
  );

  return (
    <>
      {isEmpty(data?.last) ? (
        <Text classes="mx-0 my-auto block text-center text-xl text-red-700">
          {"You haven't started your shift yet! Please press the 'Start Shift' button."}
        </Text>
      ) : (
        <Stack as="div" orientation="vertical">
          <Text classes="text-xl">{`Last shift tracked: ${isLoading ? "waiting for data..." : dateHumanized ?? "no date available"}`}</Text>
          <Earnings />
        </Stack>
      )}
    </>
  );
}

export default ShiftTrackInfo;

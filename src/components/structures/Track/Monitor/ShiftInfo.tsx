"use client";

import { useMemo } from "react";

import DateHumanizer from "@/services/Date";
import ShiftService from "@/services/Shift";

import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import useTrack from "@/hooks/useTrack";

function ShiftTrackInfo() {
  const {
    shifts,
    shiftUnclosed: { isLoading },
  } = useTrack();

  const lastShift = useMemo(() => shifts?.at(-1), [shifts]);

  const dateHumanized = useMemo(
    () => new DateHumanizer("long").humanizeDate(new Date(lastShift?.startDate ?? "")),
    [lastShift?.startDate]
  );

  const earnings = useMemo(
    () =>
      shifts?.reduce((acc, shift) => {
        if (shift?.isClosed) {
          acc += new ShiftService(shift).calculateEarnings();
        }

        return acc;
      }, 0),
    [shifts]
  );

  return (
    <>
      {shifts?.length === 0 ? (
        <Text classes="mx-0 my-auto block text-center text-xl text-red-700">
          {"You haven't started your shift yet! Please press the 'Start Shift' button."}
        </Text>
      ) : (
        <Stack as="div" orientation="vertical">
          <Text classes="text-xl">{`Last shift tracked: ${isLoading ? "waiting for data..." : dateHumanized ?? "no date available"}`}</Text>
          <Text classes="text-xl">
            Money earn at the moment:{" "}
            {isLoading ? "waiting for data..." : `${earnings?.toFixed(2)}`}$
          </Text>
        </Stack>
      )}
    </>
  );
}

export default ShiftTrackInfo;

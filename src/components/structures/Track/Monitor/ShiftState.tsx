"use client";

import { useEffect, useState } from "react";

import isEmpty from "lodash/isEmpty";
import { useInterval } from "usehooks-ts";

import ShiftService from "@/services/Shift";

import Text from "@/components/ui/Text";

import useTrack from "@/hooks/useTrack";

function ShiftState() {
  const { shiftUnclosed } = useTrack();
  const [shiftTime, setShiftTime] = useState("loading...");

  useEffect(() => {
    const { text } = ShiftService.differenceInHHmm(
      shiftUnclosed.shift?.startDate ?? "",
      shiftUnclosed.shift?.endDate ?? ""
    );
    setShiftTime(text);
  }, [shiftUnclosed.shift?.endDate, shiftUnclosed.shift?.startDate]);

  useInterval(() => {
    const { text } = ShiftService.differenceInHHmm(
      shiftUnclosed.shift?.startDate ?? "",
      shiftUnclosed.shift?.endDate ?? ""
    );
    setShiftTime(text);
  }, 5000);

  return (
    <>
      {shiftUnclosed.isLoading ? (
        <Text classes="block text-2xl">loading...</Text>
      ) : !isEmpty(shiftUnclosed.shift) ? (
        <>
          <Text classes="text-2xl">shift opened {` (${shiftTime})`}</Text>
        </>
      ) : (
        <Text classes="block text-2xl underline">No shift is being tracked</Text>
      )}
    </>
  );
}

export default ShiftState;

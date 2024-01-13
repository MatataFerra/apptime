"use client";

import { useEffect, useState } from "react";

import { useInterval } from "usehooks-ts";

import ShiftService from "@/services/Shift";

import Text from "@/components/ui/Text";

import { useShiftStateContext } from "@/store/useShiftStatusStore";

function ShiftTrackTitle() {
  const { shiftUnclosed } = useShiftStateContext((state) => state);
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
  }, 10000);

  return (
    <>
      {shiftUnclosed.isLoading ? (
        <Text classes="block text-2xl">loading...</Text>
      ) : shiftUnclosed.shift ? (
        <>
          <Text classes="text-2xl">shift opened {` (${shiftTime})`}</Text>
        </>
      ) : (
        <Text classes="block text-2xl">No shift is being tracked</Text>
      )}
    </>
  );
}

export default ShiftTrackTitle;

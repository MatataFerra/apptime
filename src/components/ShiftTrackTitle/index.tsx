"use client";

import { useEffect, useState } from "react";

import { useInterval } from "usehooks-ts";

import ShiftService from "@/services/Shift";

import Skeleton from "@/components/ui/Skeleton";
import Text from "@/components/ui/Text";

import { useShiftStateContext } from "@/store/useShiftStatusStore";

function ShiftTrackTitle() {
  const { shiftUnclosed } = useShiftStateContext((state) => state);
  const [shiftTime, setShiftTime] = useState("");

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
  }, 30000);

  return (
    <>
      {!!shiftUnclosed.shift ? (
        <Text classes="text-2xl">{`Current shift time: ${shiftTime}`}</Text>
      ) : (
        <Text classes="text-2xl">No shift is tracked</Text>
      )}
    </>
  );
}

export default ShiftTrackTitle;

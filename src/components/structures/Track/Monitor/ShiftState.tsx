"use client";

import { useEffect, useState } from "react";

import isEmpty from "lodash/isEmpty";
import { useInterval } from "usehooks-ts";

import ShiftService from "@/services/Shift";

import Text from "@/components/ui/Text";

import useTrackShift from "@/hooks/useTrackShift";

function ShiftState() {
  const { data, isLoading } = useTrackShift();
  const [shiftTime, setShiftTime] = useState("loading...");

  useEffect(() => {
    const { text } = ShiftService.differenceInHHmm(
      data?.shift?.startDate ?? "",
      data?.shift?.endDate ?? ""
    );
    setShiftTime(text);
  }, [data?.shift?.endDate, data?.shift?.startDate]);

  function updateShiftTime() {
    const { text } = ShiftService.differenceInHHmm(
      data?.shift?.startDate ?? "",
      data?.shift?.endDate ?? ""
    );
    setShiftTime(text);
  }

  useInterval(updateShiftTime, 5000);

  return (
    <>
      {isLoading ? (
        <Text classes="block text-2xl">loading...</Text>
      ) : !isEmpty(data?.shift) ? (
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

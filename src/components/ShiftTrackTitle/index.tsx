"use client";

import { useEffect, useMemo, useState } from "react";

import { Shift } from "@prisma/client";
import { useInterval } from "usehooks-ts";

import ShiftService from "@/services/Shift";

import Text from "@/components/ui/Text";

type Props = {
  shift: Shift | null | undefined;
};

function ShiftTrackTitle({ shift }: Props) {
  const textMemo = useMemo(() => {
    const { text } = ShiftService.differenceInHHmm(shift?.startDate ?? "", shift?.endDate ?? "");
    return text;
  }, [shift?.endDate, shift?.startDate]);
  const [shiftTime, setShiftTime] = useState(textMemo);

  useInterval(() => {
    const { text } = ShiftService.differenceInHHmm(shift?.startDate ?? "", shift?.endDate ?? "");
    setShiftTime(text);
  }, 30000);

  return (
    <>
      <Text classes="text-2xl">
        {!!shift ? `Current shift time: ${shiftTime}` : "No shift is tracked"}
      </Text>
    </>
  );
}

export default ShiftTrackTitle;

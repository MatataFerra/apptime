"use client";

import { useEffect, useMemo, useState } from "react";

import { Shift } from "@prisma/client";

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

  useEffect(() => {
    const MINUTE = 30000;

    const interval = setInterval(() => {
      const { text } = ShiftService.differenceInHHmm(shift?.startDate ?? "", shift?.endDate ?? "");

      setShiftTime(text);
    }, MINUTE);

    return () => clearInterval(interval);
  }, [shift?.endDate, shift?.startDate, shiftTime]);

  return (
    <>
      <Text classes="text-2xl">
        {!!shift ? `Current shift time: ${shiftTime}` : "No shift is tracked"}
      </Text>
    </>
  );
}

export default ShiftTrackTitle;

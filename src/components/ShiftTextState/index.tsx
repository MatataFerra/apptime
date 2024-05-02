"use client";

import { useCallback } from "react";

import ut from "@/services/Utilities/client";

import PopoverHome from "@/components/Popover/home";
import Text from "@/components/ui/Text";

import { useShiftStateContext } from "@/store/useShiftStatusStore";

function ShiftTextState() {
  const {
    shiftUnclosed: { shift },
  } = useShiftStateContext((state) => state);

  const checkCloseShift = useCallback(() => {
    if (typeof shift?.isClosed === "undefined") {
      return false;
    }

    return ut.isFalsyValue(shift?.isClosed);
  }, [shift?.isClosed]);

  return (
    <Text as="h2" classes="flex gap-1 text-lg">
      State:{" "}
      <Text as="span" classes={`${checkCloseShift() ? "text-green-500" : "text-red-500"} text-lg`}>
        {checkCloseShift() ? "online" : "offline"}
      </Text>
      <PopoverHome />
    </Text>
  );
}

export default ShiftTextState;

"use client";

import { useCallback } from "react";

import ut from "@/services/Utilities/client";

import PopoverHome from "@/components/Popover/home";
import Skeleton from "@/components/ui/Skeleton";
import Text from "@/components/ui/Text";

import { useShiftStateContext } from "@/store/useShiftStatusStore";

function ShiftTextState() {
  const {
    shiftUnclosed: { shift, isLoading },
  } = useShiftStateContext((state) => state);

  const checkCloseShift = useCallback(() => {
    if (typeof shift?.isClosed === "undefined") {
      return false;
    }

    return ut.isFalsyValue(shift?.isClosed);
  }, [shift?.isClosed]);

  return (
    <Text as="h2" classes="text-2xl">
      State:{" "}
      {isLoading ? (
        <Skeleton classes="h-8 w-16" />
      ) : (
        <Text
          as="span"
          classes={`${checkCloseShift() ? "text-green-500" : "text-red-500"} text-2xl`}
        >
          {checkCloseShift() ? "Open" : "Closed"}
        </Text>
      )}
      <PopoverHome />
    </Text>
  );
}

export default ShiftTextState;

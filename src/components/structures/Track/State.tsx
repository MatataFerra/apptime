"use client";

import { useCallback } from "react";

import ut from "@/services/Utilities/client";

import PopoverHome from "@/components/structures/Home/Popover";
import Text from "@/components/ui/Text";

import useHourlyShifts from "@/hooks/useHourlyShifts";

function ShiftTextState() {
  const { shiftUnclosed } = useHourlyShifts();

  const checkCloseShift = useCallback(() => {
    if (typeof shiftUnclosed?.isClosed === "undefined") {
      return false;
    }

    return ut.isFalsyValue(shiftUnclosed?.isClosed);
  }, [shiftUnclosed?.isClosed]);

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

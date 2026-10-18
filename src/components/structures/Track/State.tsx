"use client";

import { useCallback } from "react";

import ut from "@/services/Utilities/client";

import PopoverHome from "@/components/structures/Home/Popover";
import Text from "@/components/ui/Text";

import useTrack from "@/hooks/useTrack";

function ShiftTextState() {
  const {
    shiftUnclosed: { shift },
  } = useTrack();

  const checkCloseShift = useCallback(() => {
    if (typeof shift?.isClosed === "undefined") {
      return false;
    }

    return ut.isFalsyValue(shift?.isClosed);
  }, [shift?.isClosed]);

  return (
    <Text as="h2" classes="flex gap-1 text-lg">
      State:{" "}
      <Text as="span" classes={`${checkCloseShift() ? "text-accent" : "text-destructive"} text-lg`}>
        {checkCloseShift() ? "online" : "offline"}
      </Text>
      <PopoverHome />
    </Text>
  );
}

export default ShiftTextState;

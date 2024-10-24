"use client";

import { useCallback } from "react";

import ut from "@/services/Utilities/client";

import PopoverHome from "@/components/structures/Home/Popover";
import Text from "@/components/ui/Text";

import useTrackShift from "@/hooks/useTrackShift";

function ShiftTextState() {
  const { data: track } = useTrackShift();

  const checkCloseShift = useCallback(() => {
    if (typeof track?.shift?.isClosed === "undefined") {
      return false;
    }

    return ut.isFalsyValue(track?.shift?.isClosed);
  }, [track?.shift?.isClosed]);

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

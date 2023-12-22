"use client";

import PopoverHome from "@/components/Popover/home";
import Skeleton from "@/components/ui/Skeleton";
import Text from "@/components/ui/Text";

import { useShiftStateContext } from "@/store/useShiftStatusStore";

function ShiftTextState() {
  const {
    shiftUnclosed: { shift, isLoading },
  } = useShiftStateContext((state) => state);

  return (
    <Text as="h2" classes="text-2xl">
      State:{" "}
      {isLoading ? (
        <Skeleton classes="h-8 w-16" />
      ) : (
        <Text
          as="span"
          classes={`${
            isFalsy ? "text-red-500" : shift?.isClosed ? "text-red-500" : "text-green-500"
          } text-2xl`}
        >
          {typeof shift?.isClosed === "undefined" ? "Closed" : shift?.isClosed ? "Closed" : "Open"}
        </Text>
      )}
      <PopoverHome />
    </Text>
  );
}

export default ShiftTextState;

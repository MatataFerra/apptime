"use client";

import PopoverHome from "@/components/Popover/home";
import Skeleton from "@/components/ui/Skeleton";
import Text from "@/components/ui/Text";

import { useShiftStateContext } from "@/store/useShiftStatusStore";

function ShiftTextState() {
  const { shiftUnclosed } = useShiftStateContext((state) => state);

  return (
    <Text as="h2" classes="text-2xl">
      State:{" "}
      {shiftUnclosed.isLoading ? (
        <Skeleton classes="h-8 w-16" />
      ) : (
        <Text
          as="span"
          classes={`${
            typeof shiftUnclosed?.shift?.isClosed === "undefined"
              ? "text-red-500"
              : !shiftUnclosed?.shift?.isClosed
                ? "text-green-500"
                : "text-red-500"
          } text-2xl`}
        >
          {typeof shiftUnclosed?.shift?.isClosed === "undefined"
            ? "Closed"
            : !shiftUnclosed?.shift?.isClosed
              ? "Open"
              : "Closed"}
        </Text>
      )}
      <PopoverHome />
    </Text>
  );
}

export default ShiftTextState;

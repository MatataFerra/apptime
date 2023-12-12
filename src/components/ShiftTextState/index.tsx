"use client";

import ShiftService from "@/services/Shift";

import PopoverHome from "@/components/Popover/home";
import Text from "@/components/ui/Text";

import { useShiftStateContext } from "@/store/useShiftStatusStore";

function ShiftTextState() {
  const user = useShiftStateContext((state) => state.user);
  const isShiftOpen = ShiftService.findUnClosedShift(user?.shifts);

  return (
    <Text as="h2" classes="text-2xl">
      State:{" "}
      <Text
        as="span"
        classes={`${
          typeof isShiftOpen?.isClosed === "undefined"
            ? "text-red-500"
            : !isShiftOpen?.isClosed
            ? "text-green-500"
            : "text-red-500"
        } text-2xl`}
      >
        {typeof isShiftOpen?.isClosed === "undefined"
          ? "Closed"
          : !isShiftOpen?.isClosed
          ? "Open"
          : "Closed"}
      </Text>
      <PopoverHome />
    </Text>
  );
}

export default ShiftTextState;

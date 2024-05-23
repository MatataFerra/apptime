"use client";

import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/Dropdown";

import { useShiftData } from "@/store/useShiftData";

function ShiftStartPublicHolidayDropdown() {
  const { setData } = useShiftData((state) => state);
  const [isPublicHoliday, setIsPublicHoliday] = useState("false");

  function onChangeTaxCode(value: string) {
    setIsPublicHoliday(value);
    setData({ isPublicHoliday: value === "true", publicHolidayWorked: value === "true" });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="h-9 w-full flex-shrink-[1] flex-grow-[2] basis-[120px] self-baseline px-2 py-1 text-xs shadow-input">
        Is a public holiday?
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full">
        <DropdownMenuRadioGroup value={isPublicHoliday} onValueChange={onChangeTaxCode}>
          <DropdownMenuRadioItem value={"true"}>Yes! I want money 🤑</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value={"false"}>No, just regular day</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ShiftStartPublicHolidayDropdown;

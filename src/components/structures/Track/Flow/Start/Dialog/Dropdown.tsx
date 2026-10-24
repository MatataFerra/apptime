"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

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
  const t = useTranslations("track.start");

  function onChangeTaxCode(value: string) {
    setIsPublicHoliday(value);
    setData({ isPublicHoliday: value === "true", publicHolidayWorked: value === "true" });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="h-9 w-full shrink grow-2 basis-[120px] self-baseline px-2 py-1 text-xs shadow-input">
        {t("holiday_question")}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full">
        <DropdownMenuRadioGroup value={isPublicHoliday} onValueChange={onChangeTaxCode}>
          <DropdownMenuRadioItem value={"true"}>{t("holiday_yes")}</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value={"false"}>{t("holiday_no")}</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ShiftStartPublicHolidayDropdown;

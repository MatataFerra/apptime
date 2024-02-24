"use client";

import { useState } from "react";

import ShiftService from "@/services/Shift";

import Icon from "@/components/ui/Icons";
import Stack from "@/components/ui/Stack";

import DateHumanizer from "../../services/Date/index";
import { useDashboardContext } from "@/store/useDashboardStore";

function PickupDate() {
  const [isReset, setIsReset] = useState(false);
  const { filterByDate, initialShifts, resetShifts } = useDashboardContext((state) => state);

  type Acc = {
    date: string;
    value: string;
  };

  const datesSorted = ShiftService.shiftsSorted(initialShifts ?? [], { desc: false });
  const uniqueDates = datesSorted?.reduce((acc: Acc[], shift) => {
    const humanize = new DateHumanizer("short").humanizeDate(new Date(shift.startDate));
    const isDateExists = acc.some((date) => date.date === humanize);

    if (!isDateExists) {
      const newDate = { date: humanize, value: shift.startDate };
      acc.push(newDate);
    }
    return acc;
  }, []);

  function onFilterByDate(date: string) {
    if (date === "select") return;
    setIsReset(false);
    filterByDate(date);
  }

  return (
    <Stack as="menu" alignItems="center" classes="rounded-sm border border-slate-400 p-2">
      <select
        data-testid="date-filter"
        value={isReset ? "select" : undefined}
        defaultValue={"select"}
        name="date"
        id="date"
        className="bg-transparent outline-none"
        onChange={(e) => onFilterByDate(e.target.value)}
      >
        <option disabled value="select" className="border-none">
          Select Date
        </option>
        {uniqueDates?.map((shift) => (
          <option key={shift.value} value={shift.value} className="border-none">
            {shift.date}
          </option>
        ))}
      </select>
      <Icon.cancel
        onClick={() => {
          setIsReset(true);
          resetShifts();
        }}
        width={10}
        height={10}
        viewBox="0 0 20 20"
        className="cursor-pointer transition-transform duration-100 ease-in-out active:scale-150"
      />
    </Stack>
  );
}

export default PickupDate;

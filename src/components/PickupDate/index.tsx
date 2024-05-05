"use client";

import { type DateRange } from "react-day-picker";

import Button from "@/components/ui/Button";
import DateRangePicker from "@/components/ui/DateRangePicker";
import Icon from "@/components/ui/Icons";
import Stack from "@/components/ui/Stack";

import useDelayed from "@/hooks/useDelayed";

import { useDashboardContext } from "@/store/useDashboardStore";
import { useRangeSelected } from "@/store/useRangeSelected";

function PickupDate() {
  const { isRangeSelected, setDate, setIsRangeSelected } = useRangeSelected((state) => state);
  const isRangeSelectedDelayed = useDelayed(isRangeSelected, 500);
  const { filterByDate, resetShifts } = useDashboardContext((state) => state);

  function onFilterByDate(date: DateRange | undefined) {
    filterByDate(date);
  }

  return (
    <Stack as="nav" alignItems="center">
      {isRangeSelectedDelayed ? (
        <Button
          variant="rounded"
          classes={`size-3 p-0 ${isRangeSelected ? "animate-show-right" : "animate-hide-left"}`}
          onClick={() => {
            setDate(undefined);
            setIsRangeSelected(false);
            resetShifts();
          }}
        >
          <Icon.cancel width="100%" height="100%" viewBox="0 0 20 18" />
        </Button>
      ) : null}
      <DateRangePicker onDatesSelected={onFilterByDate} />
    </Stack>
  );
}

export default PickupDate;

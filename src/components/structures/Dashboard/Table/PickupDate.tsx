"use client";

import { useEffect } from "react";
import { type DateRange } from "react-day-picker";

import Button from "@/components/ui/Button";
import DateRangePicker from "@/components/ui/DateRangePicker";
import Icon from "@/components/ui/Icons";
import Stack from "@/components/ui/Stack";

import useDashboard from "@/hooks/useDashboard";
import useDelayed from "@/hooks/useDelayed";

import { useDashHourlyStore } from "@/store/useDashHourlyStore";
import { useDashProductionStore } from "@/store/useDashProductionStore";
import { useRangeSelected } from "@/store/useRangeSelected";

function PickupDate() {
  const { isRangeSelected, setDate, setIsRangeSelected, resetRange } = useRangeSelected(
    (state) => state
  );
  const { setIsDateFiltered } = useDashboard();
  const isRangeSelectedDelayed = useDelayed(isRangeSelected, 500);
  const { filterByDate: filterHourlies, reset: resetHourlies } = useDashHourlyStore();
  const { filterByDate: filterProductions, reset: resetProductions } = useDashProductionStore();

  useEffect(() => {
    resetRange();
    setIsRangeSelected(false);
  }, [resetRange, setIsRangeSelected]);

  function onFilterByDate(date: DateRange | undefined) {
    filterHourlies(date);
    filterProductions(date);
    setIsDateFiltered(true);
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
            setIsDateFiltered(false);
            resetHourlies();
            resetProductions();
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

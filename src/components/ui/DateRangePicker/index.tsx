"use client";

import { HTMLAttributes, useEffect } from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";

import { cn } from "@/utils/helpers/styleMerger";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { useRangeSelected } from "@/store/useRangeSelected";

interface DateRangePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, "className"> {
  classes?: string;
  onDatesSelected: (dates: DateRange | undefined) => void;
}

function DateRangePicker({ classes, onDatesSelected }: DateRangePickerProps) {
  const { setIsRangeSelected, setDate, date } = useRangeSelected((state) => state);

  useEffect(() => {
    if (date?.from && date?.to) {
      setIsRangeSelected(true);
    } else {
      setIsRangeSelected(false);
    }
  }, [date?.from, date?.to]);

  return (
    <div className={cn("grid gap-2", classes)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-fit justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(data) => {
              setDate(data);
              onDatesSelected(data);
            }}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default DateRangePicker;

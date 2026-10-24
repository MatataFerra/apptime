"use client";

import { HTMLAttributes, useEffect } from "react";
import { type DateRange } from "react-day-picker";

import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

import { ButtonShadCn } from "@/components/ui/buttonShadcn";
import { Calendar } from "@/components/ui/Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";

import { cn } from "@/utils/helpers/styleMerger";
import useDateLocale from "@/hooks/useDateLocale";

import { useRangeSelected } from "@/store/useRangeSelected";

interface DateRangePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, "className"> {
  classes?: string;
  onDatesSelected: (dates: DateRange | undefined) => void;
}

function DateRangePicker({ classes, onDatesSelected }: DateRangePickerProps) {
  const { setIsRangeSelected, setDate, date } = useRangeSelected((state) => state);
  const t = useTranslations("dashboard.history");
  const locale = useDateLocale();

  useEffect(() => {
    if (date?.from && date?.to) {
      setIsRangeSelected(true);
    } else {
      setIsRangeSelected(false);
    }
  }, [date?.from, date?.to, setIsRangeSelected]);

  return (
    <div className={cn("grid gap-2", classes)}>
      <Popover>
        <PopoverTrigger asChild>
          <ButtonShadCn
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
                  {format(date.from, "PP", { locale })} - {format(date.to, "PP", { locale })}
                </>
              ) : (
                format(date.from, "PP", { locale })
              )
            ) : (
              <span>{t("pick_date")}</span>
            )}
          </ButtonShadCn>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            autoFocus
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

"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { enUS, es } from "react-day-picker/locale";

import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { useLocale } from "next-intl";

import { buttonVariants } from "@/components/ui/buttonShadcn";

import { cn } from "@/utils/helpers/styleMerger";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

/**
 * DayPicker's locales: date-fns' plus its own labels ("Go to the next
 * month"…), so month names and the buttons' names follow the app's language.
 */
const LOCALES = { en: enUS, es } as const;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  const locale = LOCALES[useLocale()] ?? enUS;

  return (
    <DayPicker
      // A `locale` prop still wins.
      locale={locale}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "relative flex flex-col gap-4 sm:flex-row",
        month: "flex flex-col gap-4",
        month_caption: "flex h-7 items-center justify-center",
        caption_label: "text-sm font-medium",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "z-10 size-7 bg-transparent p-0 opacity-50 hover:opacity-100 disabled:opacity-25"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "z-10 size-7 bg-transparent p-0 opacity-50 hover:opacity-100 disabled:opacity-25"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-8 text-[0.8rem] font-normal text-muted-foreground",
        week: "mt-2 flex w-full",
        // aria-selected is on the cell itself in v10 (it was on the button before).
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 aria-selected:bg-accent-soft",
          props.mode === "range"
            ? "first:aria-selected:rounded-l-md last:aria-selected:rounded-r-md"
            : "aria-selected:rounded-md"
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal aria-selected:opacity-100"
        ),
        range_start: "rounded-l-md",
        range_end: "rounded-r-md",
        selected:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground [&>button]:focus:bg-primary [&>button]:focus:text-primary-foreground",
        // Wins over `selected`, which also applies to the days in between.
        range_middle:
          "[&>button]:bg-transparent! [&>button]:text-ink! [&>button]:hover:bg-accent-soft!",
        today: "[&>button]:bg-accent-soft [&>button]:text-ink",
        outside: "text-muted-foreground opacity-50 aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName }) =>
          orientation === "left" ? (
            <ChevronLeftIcon className={cn("size-4", chevronClassName)} />
          ) : (
            <ChevronRightIcon className={cn("size-4", chevronClassName)} />
          ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };

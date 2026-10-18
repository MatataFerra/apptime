"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";

import ShiftService from "@/services/Shift";

import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

type IncomesInputs = {
  hours: string;
  minutes: string;
  value: number;
  times: number;
  "holiday-pay": number;
  "unpaid-breaks": number;
};

const DEFAULT_HOLIDAY_PAY_RATE = 8;

function Calculator() {
  const { register, watch } = useForm<IncomesInputs>();

  const hours = watch("hours");
  const minutes = watch("minutes");
  const value = watch("value");
  const holidayPay = watch("holiday-pay");
  const times = watch("times");
  const unpaidBreaks = watch("unpaid-breaks");

  // Worked time is a duration, not a time of day: two number fields instead of
  // <input type="time">, which Safari shows as a clock ("10:00 pm") and whose
  // value it doesn't always report while editing.
  const hoursMemo = useMemo(() => {
    const h = Number(hours) || 0;
    const m = Number(minutes) || 0;
    const total = h * 60 + m;

    return ShiftService.convertAmountInDecimal(total);
  }, [hours, minutes]);

  const calculate = useMemo(() => {
    // An empty field means the default rate shown in the hint, not 0%.
    const holidayPayRate =
      holidayPay === undefined || String(holidayPay).trim() === ""
        ? DEFAULT_HOLIDAY_PAY_RATE
        : Number(holidayPay);

    const total = ShiftService.calculateEarnings({
      holidayPayRate,
      hoursWorked: hoursMemo,
      hourValue: value,
      unpaidBreaks,
      isPublicHoliday: false,
    });

    let multiply = !!times ? times : 1;

    return total * multiply;
  }, [holidayPay, hoursMemo, unpaidBreaks, value, times]);

  return (
    <>
      <Stack spacing={4} wrap>
        <div className="grid w-full grid-cols-2 gap-4">
          <Input
            type="number"
            inputMode="numeric"
            label="Hours"
            measure="h"
            min={0}
            max={24}
            {...register("hours")}
          />
          <Input
            type="number"
            inputMode="numeric"
            label="Minutes"
            measure="min"
            min={0}
            max={59}
            {...register("minutes")}
          />
        </div>
        <Input
          type="number"
          label="Value hour"
          measure="$"
          measurePlace="left"
          min={1}
          {...register("value")}
        />
        <Input
          type="number"
          label="Holiday pay"
          description={`Leave empty for the default ${DEFAULT_HOLIDAY_PAY_RATE}%`}
          measure="%"
          placeholder={String(DEFAULT_HOLIDAY_PAY_RATE)}
          defaultValue={DEFAULT_HOLIDAY_PAY_RATE}
          min={0}
          {...register("holiday-pay")}
        />
        <Input type="number" label="How many days?" min={1} {...register("times")} />
        <Input type="number" label="Unpaid breaks" min={1} {...register("unpaid-breaks")} />
      </Stack>
      <Stack
        orientation="vertical"
        spacing={1}
        classes="w-full rounded-xl bg-surface-inverse p-5 text-ink-inverse"
        aria-live="polite"
      >
        <Text classes="text-sm text-ink-inverse/70">You are going to earn:</Text>
        <Text classes={`figure text-figure ${calculate ? "text-live" : "text-ink-inverse/30"}`}>
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(calculate || 0)}
        </Text>
      </Stack>
    </>
  );
}

export default Calculator;

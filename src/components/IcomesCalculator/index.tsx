"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";

import ShiftService from "@/services/Shift";

import Input from "@/components/ui/Input_v2";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

type IncomesInputs = {
  hours: string;
  value: number;
  times: number;
  "holiday-pay": number;
  "unpaid-breaks": number;
};

function IncomesCalculator() {
  const { register, watch } = useForm<IncomesInputs>();

  const hours = watch("hours");
  const value = watch("value");
  const holidayPay = watch("holiday-pay");
  const times = watch("times");
  const unpaidBreaks = watch("unpaid-breaks");

  const hoursMemo = useMemo(() => {
    if (!hours) return 0;

    const [hour, minutes] = hours?.split(":");
    const hourToMinutes = parseInt(hour) * 60;
    const total = hourToMinutes + parseInt(minutes);

    const toDecimal = ShiftService.convertAmountInDecimal(total);

    return toDecimal;
  }, [hours]);

  const calculate = useMemo(() => {
    const total = ShiftService.calculateEarnings({
      holidayPayRate: holidayPay,
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
        <Input type="time" label="Hours" {...register("hours")} />
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
          description="by default is 8%"
          defaultValue={8}
          min={0}
          {...register("holiday-pay")}
        />
        <Input type="number" label="How many days?" min={1} {...register("times")} />
        <Input type="number" label="Unpaid breaks" min={1} {...register("unpaid-breaks")} />
      </Stack>
      <Stack orientation="vertical">
        <Text classes="text-base font-bold">You are going to earn:</Text>
        <Text classes="text-base font-bold">
          {calculate
            ? `${new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(calculate)} 🤑`
            : "$0.0 💸"}
        </Text>
      </Stack>
    </>
  );
}

export default IncomesCalculator;

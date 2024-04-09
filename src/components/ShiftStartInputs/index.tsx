"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import ShiftStartPublicHolidayDropdown from "@/components/ShiftStartPublicHolidayDropdown";
import ShiftStartTaxCodeDropdown from "@/components/ShiftStartTaxCodeDropdown";
import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";

import { useShiftData } from "@/store/useShiftData";

const InputsSchema = z.object({
  hourValue: z.number().min(1),
  holidayPayRate: z.number().min(0).max(100),
  unpaidBreaks: z.number().min(0).max(5),
});

function ShiftStartInputs() {
  const { setData, setErrors, data } = useShiftData((state) => state);
  const { register, watch } = useForm({
    resolver: zodResolver(InputsSchema),
    defaultValues: {
      hourValue: data.hourValue,
      holidayPayRate: data.holidayPayRate,
      unpaidBreaks: data.unpaidBreaks,
    },
  });

  const hourValue = watch("hourValue");
  const holidayPayRate = watch("holidayPayRate");
  const unpaidBreaks = watch("unpaidBreaks");

  useEffect(() => {
    if (!hourValue) setErrors(true);
    if (!holidayPayRate) setErrors(true);
    if (!unpaidBreaks) setErrors(true);

    if (hourValue && holidayPayRate && unpaidBreaks) setErrors(false);
  }, [holidayPayRate, hourValue, setErrors, unpaidBreaks]);

  return (
    <Stack orientation="horizontal" alignItems="center" wrap>
      <Input
        containerClasses="input-flex"
        description="Hour value"
        measure="$"
        type="number"
        min={0}
        {...register("hourValue", {
          onChange: (e) => {
            setData({ hourValue: Number(e.target.value) });
          },
        })}
      />
      <Input
        containerClasses="input-flex"
        description="Holiday Pay"
        measure="%"
        type="number"
        min={0}
        defaultValue={8}
        {...register("holidayPayRate", {
          onChange: (e) => {
            setData({ holidayPayRate: Number(e.target.value), holidayPay: true });
          },
        })}
      />
      <Input
        containerClasses="input-flex"
        description="Unpaid Breaks"
        type="number"
        min={0}
        max={5}
        defaultValue={1}
        {...register("unpaidBreaks", {
          onChange: (e) => {
            setData({ unpaidBreaks: Number(e.target.value) });
          },
        })}
      />

      <ShiftStartTaxCodeDropdown />
      <ShiftStartPublicHolidayDropdown />
    </Stack>
  );
}

export default ShiftStartInputs;

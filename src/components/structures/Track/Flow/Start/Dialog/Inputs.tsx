"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import PublicHolidayDropdown from "@/components/structures/Track/Flow/Start/Dialog/Dropdown";
import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";

import { useShiftData } from "@/store/useShiftData";

const InputsSchema = z.object({
  hourValue: z
    .string()
    .min(1)
    .refine((value) => !!value, {
      message: "Hour value is required",
    }),
  unpaidBreaks: z.string().refine((value) => !!value, {
    message: "Unpaid breaks is required",
  }),
});

function ShiftStartInputs() {
  const { setData, setErrors } = useShiftData((state) => state);
  const { register, watch } = useForm({
    resolver: zodResolver(InputsSchema),
    defaultValues: {
      hourValue: "",
      unpaidBreaks: "1",
    },
  });

  const hourValue = watch("hourValue");
  const unpaidBreaks = watch("unpaidBreaks");

  useEffect(() => {
    if (!hourValue) setErrors(true);
    if (!unpaidBreaks) setErrors(true);

    if (hourValue && unpaidBreaks) setErrors(false);
  }, [hourValue, setErrors, unpaidBreaks]);

  useEffect(() => {
    if (hourValue) setData({ hourValue: Number(hourValue) });
  }, [hourValue, setData]);

  useEffect(() => {
    if (unpaidBreaks) setData({ unpaidBreaks: unpaidBreaks ? Number(unpaidBreaks) : 1 });
  }, [unpaidBreaks, setData]);

  return (
    <>
      <Stack orientation="horizontal" alignItems="center" wrap>
        <Input
          data-testid="hourValue"
          description="Hour value"
          measure="$"
          type="number"
          required
          min={0}
          {...register("hourValue", {})}
        />
        <Input
          description="Unpaid Breaks"
          type="number"
          min={0}
          max={5}
          required
          {...register("unpaidBreaks", {})}
        />
      </Stack>
      <Stack orientation="vertical" classes="h-20">
        <PublicHolidayDropdown />
      </Stack>
    </>
  );
}

export default ShiftStartInputs;

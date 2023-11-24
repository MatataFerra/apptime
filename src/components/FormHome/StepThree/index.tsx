"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";

import RadioWithInput from "@/components/RadioWithInput";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { radioInputHandleValue } from "@/utils/helpers/radioInputHandleValue";

import { useFormStore } from "@/store/useFormStore";
import { useRadioInput } from "@/store/useRadioInput";

function StepThree() {
  const { register } = useForm();
  const { setProfile, profile } = useFormStore();
  const { value, setValue } = useRadioInput();

  const memoValue = useMemo(() => radioInputHandleValue(Number(value)), [value]);

  function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    if (name === "unpaidBreaks") {
      setValue(value);
    }

    setProfile({ [name]: Number(value) });
  }

  return (
    <>
      <Stack grid cols={1} classes="w-full" spacing={4}>
        <RadioWithInput
          min={0}
          radioLabel="Night shift?"
          radioGroupName="extraNightShiftPay"
          inputLabel="extra for night hour"
          measure="$"
          measurePlace="left"
          popoverContent={
            <Text>
              Normally you start your shift at night, e.g.: 22:00. The company will pay you extra
              for those hours. By default is 0
            </Text>
          }
          {...register("extraNightShiftPay", {
            onChange: onInputChange,
            value: !!profile.extraNightShiftPay && profile.extraNightShiftPay,
          })}
        />
        <RadioWithInput
          min={0}
          radioLabel="Holiday pay?"
          radioGroupName="holidayPay"
          inputLabel="rate of holiday pay"
          measure="%"
          measurePlace="right"
          inputDescription="By default is 8%"
          {...register("holidayPay", {
            onChange: onInputChange,
            value: !!profile.holidayPay && profile.holidayPay,
          })}
        />
        <RadioWithInput
          min={0}
          max={10}
          radioLabel="Unpaid breaks?"
          radioGroupName="unpaidBreaks"
          popoverContent={
            <Text classes="flex flex-col">
              Normally you could have 2 or 3 breaks, 2 of 30 min or 2 of 15 min and 1 of 30 min. The
              company will pay you 30 min of those hour of break, the rest is unpaid.
              <Text as="span" classes="mt-2 font-bold">
                If you select 1, it means they don&apos;t pay you 30 min, if you select 2, they
                don&apos;t pay you 1 hour
              </Text>
            </Text>
          }
          inputDescription={`They will NOT pay you: ${
            memoValue
              ? `${memoValue.hours ? memoValue.hours : ""} ${
                  memoValue.minutes ? memoValue.minutes : ""
                }`
              : ""
          }`}
          {...register("unpaidBreaks", {
            onChange: onInputChange,
            value: !!profile.unpaidBreaks && profile.unpaidBreaks,
          })}
        />
      </Stack>
    </>
  );
}

export default StepThree;

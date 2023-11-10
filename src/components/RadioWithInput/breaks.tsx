"use client";

import { useMemo } from "react";

import RadioWithInput from "@/components/RadioWithInput";
import Text from "@/components/ui/Text";

import { radioInputHandleValue } from "@/utils/helpers/radioInputHandleValue";

import { useRadioInput } from "@/store/useRadioInput";

function RadioWithInputBreaks() {
  const { value, setValue } = useRadioInput();

  const memoValue = useMemo(() => radioInputHandleValue(Number(value)), [value]);

  return (
    <RadioWithInput
      value={value}
      onChange={(e) => setValue(e.target.value)}
      radioLabel="Unpaid breaks?"
      isRadioRequired
      radioGroupName="breaks"
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
    />
  );
}

export default RadioWithInputBreaks;

"use client";

import { createRef, RefObject, useEffect, useRef } from "react";

import { format } from "date-fns";
import { capitalize } from "lodash";

import Box from "@/components/ui/Box";
import { DialogDescription } from "@/components/ui/Dialog";
import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import useTimeLabel, { type Labels } from "@/hooks/useTimeLabel";

import { useShiftStateContext } from "@/store/useShiftStatusStore";
export const LABELS = ["from", "to", "start", "end"] as const;

const INPUTS = Array.from(LABELS).map((label) => ({ label }));

function FinishDescription() {
  let inputRefs = useRef(INPUTS.map(() => createRef() as unknown as RefObject<HTMLInputElement>));
  const { diff, setDiff, getDifference, initialState, inputValue, setInputValue } =
    useTimeLabel(inputRefs);
  const {
    inputsDisabled,
    updateShift,
    shiftUnclosed: { shift },
    clickOnSave,
  } = useShiftStateContext((state) => state);

  useEffect(() => {
    if (!inputsDisabled) {
      inputRefs.current[0].current?.focus();
    }
  }, [inputsDisabled]);

  useEffect(() => {
    const { from, to, start, end } = inputValue;

    // create a new date object
    const startDate = new Date(`${from} ${start}`);
    const endDate = new Date(`${to} ${end}`);

    // update shift state
    updateShift({
      startDate: startDate.toString(),
      endDate: endDate.toString(),
      id: shift?.id,
    });
  }, [inputValue, shift?.id, updateShift]);

  useEffect(() => {
    if (clickOnSave) {
      const t = getDifference();
      setDiff(t);
    } else {
      setDiff(initialState.diff);
      setInputValue({
        ...initialState,
      });
    }
  }, [clickOnSave, getDifference, initialState, initialState.diff, setDiff, setInputValue]);

  useEffect(() => {
    const t = getDifference();
  }, [diff, initialState, getDifference]);

  return (
    <>
      <DialogDescription asChild>
        <Box>
          <Stack orientation="vertical" grid cols={2} classes="mb-8" spacing={4}>
            {INPUTS.map(({ label }, index) => {
              return (
                <Input
                  containerClasses="grid grid-cols-[1fr,1fr] !gap-4 items-center w-full"
                  key={label}
                  label={capitalize(label)}
                  value={inputValue[label as Labels]}
                  type={label === "start" || label === "end" ? "time" : "date"}
                  variant="underline"
                  classes={`h-8 w-32 text-sm outline-none transition-all ${
                    inputsDisabled ? "border-b-2 border-gray-100" : "border-b-2"
                  }`}
                  disabled={inputsDisabled}
                  data-label={label}
                  data-testid={label}
                  ref={inputRefs.current[index]}
                  max={format(new Date(), "yyyy-MM-dd")}
                  onChange={(_) => {
                    const t = getDifference();

                    setInputValue((prev) => ({ ...prev, [label]: _.target.value }));

                    setDiff(t);
                  }}
                />
              );
            })}
          </Stack>
          <Stack>
            <Text classes="text-xl font-semibold">Time elapsed: {diff}</Text>
          </Stack>
        </Box>
      </DialogDescription>
    </>
  );
}

export default FinishDescription;

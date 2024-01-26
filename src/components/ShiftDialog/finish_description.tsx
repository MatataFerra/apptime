"use client";

import { createRef, RefObject, useEffect, useRef } from "react";

import { format } from "date-fns";
import { capitalize } from "lodash";

import Box from "@/components/ui/Box";
import Button from "@/components/ui/Button";
import { DialogDescription } from "@/components/ui/Dialog";
import Icon from "@/components/ui/Icons";
import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import useInputValue from "@/hooks/useInputValue";
import useTimeLabel, { type Labels } from "@/hooks/useTimeLabel";

import { useShiftStateContext } from "@/store/useShiftStatusStore";
export const LABELS = ["from", "to", "start", "end"] as const;

const INPUTS = Array.from(LABELS).map((label) => ({ label }));

function FinishDescription() {
  let inputRefs = useRef(INPUTS.map(() => createRef() as unknown as RefObject<HTMLInputElement>));
  const { diff, initialState } = useTimeLabel();
  const { inputValue, setInputValue } = useInputValue();
  const {
    updateShift,
    inputsDisabled,
    shiftUnclosed: { shift },
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
                    setInputValue({
                      [label]: _.target.value,
                    });
                  }}
                />
              );
            })}
          </Stack>
          <Stack alignItems="center">
            <Text classes="text-xl font-semibold">Time elapsed: {diff}</Text>
            <Button
              type="button"
              variant="white"
              onClick={() => {
                setInputValue({
                  ...initialState,
                });
              }}
              classes="mx-auto my-0 w-fit self-center p-2 active:shadow-button-inner"
            >
              <Icon.reset className="size-4 fill-black font-bold" />
            </Button>
          </Stack>
        </Box>
      </DialogDescription>
    </>
  );
}

export default FinishDescription;

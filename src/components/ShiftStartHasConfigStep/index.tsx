"use client";

import { useMemo } from "react";

import Button from "@/components/ui/Button";
import { DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import Image from "@/components/ui/Image";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { TAX_CODES } from "@/utils/constants";

import ShiftStartButton from "../ShiftStartButton";
import ShiftStartPublicHolidayDropdown from "../ShiftStartPublicHolidayDropdown";
import { useShiftData } from "@/store/useShiftData";

function ShiftStartHasConfigStep() {
  const { setStep, data } = useShiftData((state) => state);
  const taxCode = useMemo(
    () =>
      Object.keys(TAX_CODES).find(
        (key) => TAX_CODES[key as keyof typeof TAX_CODES] === Number(data.taxCode)
      ),
    [data.taxCode]
  );
  return (
    <>
      <DialogHeader className="text-left">
        <DialogTitle>
          <Stack orientation="horizontal" alignItems="center">
            <Image
              src="/assets/marks/question_mark.svg"
              alt="Do you want to use your previous config?"
              classes="object-contain"
              height={50}
              width={50}
            />
            <Text>A previous shift configuration was found</Text>
          </Stack>
        </DialogTitle>
      </DialogHeader>
      <Stack orientation="vertical">
        <ul className="grid grid-cols-2 gap-x-3 gap-y-2 text-left text-sm text-gray-500 dark:text-gray-400">
          <li className="flex items-center space-x-1">
            <svg
              className="h-3.5 w-3.5 flex-shrink-0 text-green-500 dark:text-green-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 16 12"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 5.917 5.724 10.5 15 1.5"
              />
            </svg>
            <span>Hour value: ${data.hourValue}</span>
          </li>
          <li className="flex items-center space-x-1">
            <svg
              className="h-3.5 w-3.5 flex-shrink-0 text-green-500 dark:text-green-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 16 12"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 5.917 5.724 10.5 15 1.5"
              />
            </svg>
            <span>Holiday pay: {data.holidayPayRate}%</span>
          </li>
          <li className="flex items-center space-x-1">
            <svg
              className="h-3.5 w-3.5 flex-shrink-0 text-green-500 dark:text-green-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 16 12"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 5.917 5.724 10.5 15 1.5"
              />
            </svg>
            <span>Tax code: {taxCode}</span>
          </li>
          <li className="flex items-center space-x-1">
            <svg
              className="h-3.5 w-3.5 flex-shrink-0 text-green-500 dark:text-green-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 16 12"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 5.917 5.724 10.5 15 1.5"
              />
            </svg>
            <span>Unpaid breaks: {data.unpaidBreaks}</span>
          </li>
        </ul>
      </Stack>
      <ShiftStartPublicHolidayDropdown />
      <Stack>
        <Button
          variant="white"
          classes="w-full p-2 text-sm active:shadow-button-inner"
          onClick={() => setStep("ShiftInfo")}
        >
          Edit
        </Button>
        <ShiftStartButton title="Start shift" />
      </Stack>
    </>
  );
}

export default ShiftStartHasConfigStep;

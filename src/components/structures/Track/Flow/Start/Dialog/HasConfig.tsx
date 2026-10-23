"use client";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { History } from "lucide-react";

import StartButton from "@/components/structures/Track/Flow/Start/Button";
import Dropdown from "@/components/structures/Track/Flow/Start/Dialog/Dropdown";
import Button from "@/components/ui/Button";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import useEmployers from "@/hooks/useEmployers";

import { useShiftData } from "@/store/useShiftData";

function ShiftStartHasConfigStep() {
  const { setStep, data } = useShiftData((state) => state);
  const { byId } = useEmployers();
  const employer = data.employerId != null ? byId.get(data.employerId) : undefined;

  return (
    <>
      <DialogHeader className="text-left">
        <DialogTitle>
          <Stack orientation="horizontal" alignItems="center" spacing={3}>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
              <History className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <Text as="span" classes="font-display text-lg leading-tight font-semibold">
              Use your last shift settings?
            </Text>
          </Stack>
        </DialogTitle>
        <DialogDescription>
          <VisuallyHidden.Root>
            A previous shift configuration was found. Do you want to use it?
          </VisuallyHidden.Root>
        </DialogDescription>
      </DialogHeader>
      <Stack orientation="vertical" alignItems="center">
        <ul className="grid w-full grid-cols-1 gap-2 text-left text-sm text-ink-muted">
          <li className="flex items-center space-x-1">
            <svg
              className="h-3.5 w-3.5 shrink-0 text-accent"
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
              className="h-3.5 w-3.5 shrink-0 text-accent"
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
          {employer ? (
            <li className="flex items-center space-x-1">
              <svg
                className="h-3.5 w-3.5 shrink-0 text-accent"
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
              <span>Employer: {employer.name}</span>
            </li>
          ) : null}
        </ul>
      </Stack>
      <Dropdown />
      <Stack>
        <Button
          variant="white"
          classes="w-full p-2 text-sm active:shadow-button-inner"
          onClick={() => setStep("ShiftInfo")}
        >
          Edit
        </Button>
        <StartButton title="Start shift" />
      </Stack>
    </>
  );
}

export default ShiftStartHasConfigStep;

"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

import Icon from "@/components/ui/Icons";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { useDrawerStore } from "@/store/useDrawerStore";

function DrawerOptions() {
  const router = useRouter();
  const toggle = useDrawerStore((state) => state.toggle);

  function handleHistoryShifts() {
    toggle();
    router.push("/history-shifts");
  }

  function handleFastCharge() {
    toggle();
    router.push("/fast-charge");
  }

  function handleEstimateIncome() {
    toggle();
    router.push("/incomes");
  }

  function handleLogout() {
    toggle();
    signOut();
  }

  return (
    <>
      <Stack grid rows="1fr auto" classes="h-full w-full">
        <Stack as="div" orientation="vertical" spacing={0} classes="w-full divide-y">
          <Stack
            data-testid="fast-charge"
            as="button"
            alignItems="center"
            classes="drawer-option"
            onClick={handleFastCharge}
          >
            <Text classes="select-none font-medium">Fast charge</Text>
          </Stack>
          <Stack
            data-testid="history-shifts"
            as="button"
            alignItems="center"
            classes="drawer-option"
            onClick={handleHistoryShifts}
          >
            <Text classes="select-none font-medium">History of shifts</Text>
          </Stack>
          <Stack
            as="button"
            alignItems="center"
            classes="drawer-option"
            onClick={handleEstimateIncome}
          >
            <Text classes="select-none font-medium">Estimate income</Text>
          </Stack>
        </Stack>
        <Stack classes="items-center p-4">
          <Stack as="button" classes="cursor-pointer" onClick={handleLogout}>
            <Icon.logout className="size-10 justify-self-center" />
          </Stack>
        </Stack>
      </Stack>
    </>
  );
}

export default DrawerOptions;

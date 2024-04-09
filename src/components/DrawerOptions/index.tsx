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
        <Stack orientation="vertical" classes="w-full">
          <Stack
            data-testid="fast-charge"
            as="button"
            grid
            cols="10% 1fr"
            spacing={4}
            alignItems="center"
            classes="relative w-full px-4 py-2 text-left active:after:absolute active:after:inset-0 active:after:-z-10 active:after:bg-slate-100"
            onClick={handleFastCharge}
          >
            <Icon.lightning className="justify-self-center" />
            <Text classes="select-none font-bold">Fast charge</Text>
          </Stack>
          <Stack
            data-testid="history-shifts"
            as="button"
            grid
            cols="10% 1fr"
            spacing={4}
            alignItems="center"
            classes="relative w-full px-4 py-2 text-left active:after:absolute active:after:inset-0 active:after:-z-10 active:after:bg-slate-100"
            onClick={handleHistoryShifts}
          >
            <Icon.clock className="justify-self-center" />
            <Text classes="select-none font-bold">History of shifts</Text>
          </Stack>
          <Stack
            as="button"
            grid
            cols="10% 1fr"
            spacing={4}
            alignItems="center"
            classes="relative w-full px-4 py-2 text-left active:after:absolute active:after:inset-0 active:after:-z-10 active:after:bg-slate-100"
            onClick={handleEstimateIncome}
          >
            <Icon.calculator className="justify-self-center" />
            <Text classes="select-none font-bold">Estimate income</Text>
          </Stack>
        </Stack>
        <Stack classes="group items-center p-4">
          <Stack as="button" classes="cursor-pointer" onClick={handleLogout}>
            <Icon.logout className="size-10 justify-self-center" />
          </Stack>
          <Text classes="animate-fade-out invisible transition-all duration-500 group-hover:visible group-hover:animate-fade-in">
            Logout
          </Text>
        </Stack>
      </Stack>
    </>
  );
}

export default DrawerOptions;

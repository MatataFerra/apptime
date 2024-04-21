"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

import Icon from "@/components/ui/Icons";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { useDrawerStore } from "@/store/useDrawerStore";

const DRAWER_OPTIONS = [
  {
    id: "fast-charge",
    label: "Fast charge",
    dataTestId: "fast-charge",
    url: "/fast-charge",
  },
  {
    id: "history-shifts",
    label: "History of shifts",
    dataTestId: "history-shifts",
    url: "/history-shifts",
  },
  {
    id: "estimate-income",
    label: "Estimate income",
    dataTestId: "estimate-income",
    url: "/incomes",
  },
  {
    id: "production-job",
    label: "Production Job",
    dataTestId: "production-job",
    url: "/production",
  },
];

function DrawerOptions() {
  const router = useRouter();
  const toggle = useDrawerStore((state) => state.toggle);

  function handleLogout() {
    toggle();
    signOut();
  }

  return (
    <>
      <Stack grid rows="1fr auto" classes="h-full w-full">
        <Stack as="div" orientation="vertical" spacing={0} classes="w-full divide-y">
          {DRAWER_OPTIONS.map((option) => (
            <Stack
              key={option.id}
              data-testid={option.dataTestId}
              as="button"
              alignItems="center"
              classes="drawer-option"
              onClick={() => {
                router.push(option.url);
                toggle();
              }}
            >
              <Text classes="select-none font-medium">{option.label}</Text>
            </Stack>
          ))}
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

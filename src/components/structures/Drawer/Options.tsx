"use client";

import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useLocale } from "next-intl";

import Login from "@/components/structures/Auth/Login";
import Logout from "@/components/structures/Auth/Logout";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { PATH_NAMES } from "@/utils/constants/pathnames";

import { useDrawerStore } from "@/store/useDrawerStore";

type Option = {
  id: string;
  label: string;
  dataTestId: string;
  url: string;
};

const DRAWER_OPTIONS: Option[] = [
  {
    id: "fast-charge",
    label: "Fast charge",
    dataTestId: "fast-charge",
    url: "/fast-charge",
  },
  {
    id: "production-job",
    label: "Production Job",
    dataTestId: "production-job",
    url: "/production",
  },
  {
    id: "track-time",
    label: "Track time",
    dataTestId: "track-time",
    url: "/track",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    dataTestId: "dashboard",
    url: "/dashboard",
  },
  {
    id: "estimate-income",
    label: "Estimate income",
    dataTestId: "estimate-income",
    url: "/incomes",
  },
  {
    id: "compare",
    label: "Compare",
    dataTestId: "compare",
    url: "/compare",
  },
  {
    id: "settings",
    label: "Settings",
    dataTestId: "settings",
    url: "/settings",
  },
];

function DrawerOptions() {
  const router = useRouter();
  const path = usePathname();
  const locale = useLocale();
  const { status } = useSession();
  const toggle = useDrawerStore((state) => state.toggle);

  function handleLogout() {
    toggle();
    signOut({
      callbackUrl: PATH_NAMES.HOME,
      redirect: true,
    });
  }

  function handleLogin() {
    toggle();
    router.push(`/${locale}${PATH_NAMES.LOGIN}?redirect=${path}`);
  }

  return (
    <>
      <Stack grid rows="1fr auto" cols="1fr" classes="h-full w-full">
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
          {status === "authenticated" ? (
            <Logout handleLogout={handleLogout} />
          ) : (
            <Login handleLogin={handleLogin} />
          )}
        </Stack>
      </Stack>
    </>
  );
}

export default DrawerOptions;

"use client";

import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useLocale } from "next-intl";

import Login from "@/components/structures/Auth/Login";
import Logout from "@/components/structures/Auth/Logout";
import Option from "@/components/structures/Drawer/Option";
import Stack from "@/components/ui/Stack";

import { PATH_NAMES } from "@/utils/constants/pathnames";

import Title from "./Title";
import { useDrawerStore } from "@/store/useDrawerStore";

type DrawerOption = {
  id: string;
  label: string;
  dataTestId: string;
  url: string;
};

const MODULES: DrawerOption[] = [
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
];

const FEATURES: DrawerOption[] = [
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
];

const USER_OPTIONS: DrawerOption[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    dataTestId: "dashboard",
    url: "/dashboard",
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
      <Stack grid rows="1fr 1fr" cols="1fr" classes="h-full w-full">
        <Stack
          as="div"
          orientation="vertical"
          spacing={0}
          classes="w-full divide-y divide-sky-300/50"
        >
          <Stack as="div" orientation="vertical" classes="w-full py-2">
            <Title title="User options" />
            {USER_OPTIONS.map((option) => (
              <Option key={option.id} option={option} />
            ))}
          </Stack>
          <Stack as="div" orientation="vertical" classes="w-full py-2">
            <Title title="Modules" />
            {MODULES.map((option) => (
              <Option key={option.id} option={option} />
            ))}
          </Stack>
          <Stack as="div" orientation="vertical" classes="w-full py-2">
            <Title title="Features" />
            {FEATURES.map((option) => (
              <Option key={option.id} option={option} />
            ))}
          </Stack>
        </Stack>
        <Stack classes="items-center px-4">
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

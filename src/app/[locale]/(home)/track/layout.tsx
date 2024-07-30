import type { PropsWithChildren, ReactNode } from "react";

import isEmpty from "lodash/isEmpty";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

import HourlyService from "@/services/Shift/Hourly";
import UserService from "@/services/User";

import Image from "@/components/ui/Image";
import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

const State = dynamic(() => import("@/components/structures/Track/State"), {
  ssr: false,
  loading: () => <Skeleton classes="h-12 w-1/3" />,
});

type Props = {
  screen: ReactNode;
  start: ReactNode;
};

export default async function Layout({ children, start, screen }: PropsWithChildren<Props>) {
  const user = await UserService.getSessionUser();

  return (
    <Stack orientation="vertical" spacing={8}>
      {children}
      <Stack orientation="vertical" justifyContent="between" classes="h-[65dvh] w-full" spacing={8}>
        <State />
        {screen}
        {start}
      </Stack>
    </Stack>
  );
}

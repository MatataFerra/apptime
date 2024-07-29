import type { ReactNode } from "react";

import dynamic from "next/dynamic";

import UserService from "@/services/User";

import HydrateStore from "@/components/structures/Track/HydrateStore";
import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

const Buttons = dynamic(() => import("@/components/modules/Track/Buttons"), {
  ssr: false,
  loading: () => <Skeleton classes="h-12 w-full" />,
});

const State = dynamic(() => import("@/components/structures/Track/State"), {
  ssr: false,
  loading: () => <Skeleton classes="h-12 w-1/3" />,
});

type Props = {
  children: ReactNode;
  screen: ReactNode;
};

export default async function Layout({ children, screen }: Props) {
  const user = await UserService.getSessionUser();

  return (
    <HydrateStore data={{ user }}>
      <Stack orientation="vertical" spacing={8}>
        {children}
        <Stack
          orientation="vertical"
          justifyContent="between"
          classes="h-[65dvh] w-full"
          spacing={8}
        >
          <State />
          {screen}
          <Buttons />
        </Stack>
      </Stack>
    </HydrateStore>
  );
}

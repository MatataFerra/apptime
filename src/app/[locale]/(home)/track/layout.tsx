import type { ReactNode } from "react";

import UserService from "@/services/User";

import HydrateStore from "@/components/structures/Track/HydrateStore";
import Stack from "@/components/ui/Stack";

type Props = {
  children: ReactNode;
  screen: ReactNode;
  buttons: ReactNode;
  fab: ReactNode;
};

export default async function Layout({ children, screen, fab, buttons }: Props) {
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
          {screen}
          {buttons}
        </Stack>
        {fab}
      </Stack>
    </HydrateStore>
  );
}

import type { ReactNode } from "react";

import UserService from "@/services/User";

import HydrateStore from "@/components/structures/Track/HydrateStore";
import Stack from "@/components/ui/Stack";

type Props = {
  children: ReactNode;
  monitor: ReactNode;
  fab: ReactNode;
};

export default async function Layout({ children, monitor, fab }: Props) {
  const user = await UserService.getSessionUser();

  return (
    <HydrateStore data={{ user }}>
      <Stack orientation="vertical" spacing={8}>
        {children}
        {monitor}
        {fab}
      </Stack>
    </HydrateStore>
  );
}

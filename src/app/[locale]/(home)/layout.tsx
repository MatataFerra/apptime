import type { ReactElement } from "react";

import dynamic from "next/dynamic";

import ModuleShell from "@/components/Layout/ModuleShell";
import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

const SheetHamMenu = dynamic(() => import("@/components/modules/SheetHamMenu/SheetHamMenu"), {
  ssr: false,
});

const UserInfo = dynamic(() => import("@/components/structures/SheetHamMenu/UserInfo"), {
  ssr: false,
});

const Header = dynamic(() => import("@/components/ui/Header"), {
  ssr: false,
  loading: () => (
    <Stack orientation="horizontal">
      <Skeleton classes="size-10" />
      <Skeleton classes="h-6 w-28" />
    </Stack>
  ),
});

interface Props {
  children: ReactElement;
}

export default async function HomeLayout({ children }: Props) {
  return (
    <ModuleShell
      header={
        <Header
          position="between"
          classes="sticky top-0 z-10 h-16 bg-(--band) pb-0! transition-colors"
        >
          <SheetHamMenu>
            <UserInfo />
          </SheetHamMenu>
        </Header>
      }
    >
      {children}
    </ModuleShell>
  );
}

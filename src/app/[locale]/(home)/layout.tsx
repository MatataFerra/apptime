import type { ReactElement } from "react";

import dynamic from "next/dynamic";

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
      <Skeleton classes="h-10 w-20" />
      <Skeleton classes="w-50 h-10" />
    </Stack>
  ),
});

interface Props {
  children: ReactElement;
}

export default async function HomeLayout({ children }: Props) {
  return (
    <>
      <main
        vaul-drawer-wrapper=""
        className="grid h-full min-h-dvh grid-rows-[auto_1fr] bg-white *:p-4"
        data-testid="drawer-close"
      >
        <Header
          position="between"
          classes="sticky top-0 z-10 bg-white bg-clip-text backdrop-blur-md backdrop-opacity-100 backdrop-filter"
        >
          <SheetHamMenu>
            <UserInfo />
          </SheetHamMenu>
        </Header>
        {children}
      </main>
    </>
  );
}

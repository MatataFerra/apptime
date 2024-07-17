import type { ReactElement } from "react";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

const Drawer = dynamic(() => import("@/components/modules/Drawer/Menu"), {
  ssr: false,
});

const UserInfo = dynamic(() => import("@/components/structures/Drawer/UserInfo"), {
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

const Ham = dynamic(() => import("@/components/structures/share/Ham"), {
  ssr: false,
  loading: () => <Skeleton classes="h-10 w-10" />,
});

interface Props {
  children: ReactElement;
}

export default async function HomeLayout({ children }: Props) {
  return (
    <>
      <main
        vaul-drawer-wrapper=""
        className="grid h-dvh grid-rows-[auto,1fr] gap-8 bg-white p-4"
        data-testid="drawer-close"
      >
        <Header position="between" classes="relative">
          <Ham />
          <Drawer>
            <UserInfo />
          </Drawer>
        </Header>
        {children}
      </main>
    </>
  );
}

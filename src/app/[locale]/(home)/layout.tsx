import { ReactElement } from "react";

import DrawerMenu from "@/components/DrawerMenu";
import DrawerUserInfo from "@/components/DrawerUserInfo";
import Ham from "@/components/Ham";
import Header from "@/components/ui/Header";

interface Props {
  children: ReactElement;
}

export default async function HomeLayout({ children }: Props) {
  return (
    <main className="grid h-[100dvh] grid-rows-[auto,1fr] gap-8 p-7">
      <Header position="between">
        <Ham />
      </Header>
      <DrawerMenu>
        <DrawerUserInfo />
      </DrawerMenu>
      {children}
    </main>
  );
}

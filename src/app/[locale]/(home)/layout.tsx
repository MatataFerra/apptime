import { ReactElement } from "react";

import DrawerMenu from "@/components/DrawerMenu";
import DrawerUserInfo from "@/components/DrawerUserInfo";
import Ham from "@/components/Ham";
import Staging from "@/components/Staging";
import Header from "@/components/ui/Header";

interface Props {
  children: ReactElement;
}

export default async function HomeLayout({ children }: Props) {
  return (
    <Staging>
      <main className="grid h-[100dvh] grid-rows-[auto,1fr] gap-8 p-4">
        <Header position="between">
          <Ham />
        </Header>
        <DrawerMenu>
          <DrawerUserInfo />
        </DrawerMenu>
        {children}
      </main>
    </Staging>
  );
}

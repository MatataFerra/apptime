import { ReactElement } from "react";

import Header from "@/components/ui/Header";
import Img from "@/components/ui/Image";

interface Props {
  children: ReactElement;
}

export default function HomeLayout({ children }: Props) {
  return (
    <main className="grid h-[100dvh] grid-rows-[auto,1fr] gap-8 p-7">
      <Header position="between">
        <Img src="/assets/ham-menu.svg" alt="arrow-left" width={50} height={50} />
      </Header>
      {children}
    </main>
  );
}

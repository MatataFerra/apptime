import { ReactElement } from "react";

import Header from "@/components/Header";

interface Props {
  children: ReactElement;
}

function LayoutMobile({ children }: Props) {
  return (
    <>
      <main className="grid h-[100dvh] grid-rows-[auto,1fr,auto] justify-center gap-2 p-7">
        <Header position="center" />
        {children}
      </main>
    </>
  );
}

export default LayoutMobile;

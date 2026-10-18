import type { ReactNode } from "react";

import Header from "@/components/ui/Header";

interface Props {
  children: ReactNode;
}

function LayoutMobile({ children }: Props) {
  return (
    <>
      <main className="grid h-dvh grid-rows-[auto_1fr_auto] p-7">
        <Header position="center" />
        {children}
      </main>
      <div className="bg-login" />
    </>
  );
}

export default LayoutMobile;

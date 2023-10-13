import { ReactElement } from "react";

import Header from "@/components/ui/Header";

interface Props {
  children: ReactElement;
}

function LayoutMobile({ children }: Props) {
  return (
    <>
      <main className="grid h-[100dvh] grid-rows-[auto,1fr,auto] p-7">
        <Header position="center" />
        {children}
      </main>
      <div className="bg-login" />
    </>
  );
}

export default LayoutMobile;

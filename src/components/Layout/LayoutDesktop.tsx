import { ReactElement } from "react";

import Header from "@/components/ui/Header";

interface Props {
  children: ReactElement;
}

function LayoutDesktop({ children }: Props) {
  return (
    <>
      <main className="relative grid h-screen grid-rows-[auto_1fr] overflow-hidden">
        <Header position="start" classes="px-4 py-2 [&>h1]:text-xl [&>img]:h-6 [&>img]:w-6" />
        <section className="flex flex-col items-center justify-center p-2">{children}</section>
      </main>
    </>
  );
}

export default LayoutDesktop;

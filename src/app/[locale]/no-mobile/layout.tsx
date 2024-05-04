import { ReactElement } from "react";

import Header from "@/components/ui/Header";

interface Props {
  children: ReactElement;
}

export default function Layout({ children }: Props) {
  return (
    <main className="relative grid h-screen grid-rows-[auto,1fr] overflow-hidden">
      <Header classes="px-4 py-2" />
      <section className="flex flex-col items-center justify-center p-2">{children}</section>
    </main>
  );
}

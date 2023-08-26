import { Text } from "@/components";
import { cm } from "@/utils/helpers";
import { ReactElement } from "react";

interface Props {
  children: ReactElement;
}

export default function NoMobileLayout({ children }: Props) {
  return (
    <main className="relative grid h-screen grid-rows-[auto,1fr] overflow-hidden">
      <header className="flex items-center justify-start gap-2 px-4 py-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/apptime-logo.svg" alt="App time logo" width={25} height={25} />
        <Text as="h1" variants="gradient" classes="text-xl font-bold">
          App Time
        </Text>
      </header>
      <section className={cm("flex flex-col items-center justify-center p-2")}>{children}</section>
    </main>
  );
}

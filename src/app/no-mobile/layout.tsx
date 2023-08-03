import { Text } from "@/components";
import { cm } from "@/utils/helpers";
import { ReactElement } from "react";

interface Props {
  children: ReactElement;
}

export default function NoMobileLayout({ children }: Props) {
  return (
    <>
      <header className="flex gap-2 justify-start items-center py-2 px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/apptime-logo.svg"
          alt="App time logo"
          width={25}
          height={25}
        />
        <Text as="h1" variants="gradient" classes="text-xl font-bold">
          App Time
        </Text>
      </header>
      <main className={cm("flex flex-col items-center justify-center p-2")}>
        {children}
      </main>
    </>
  );
}

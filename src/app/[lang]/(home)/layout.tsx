import { Text } from "@/components";
import { ReactElement } from "react";

interface Props {
  children: ReactElement;
}

export default function NoMobileLayout({ children }: Props) {
  return (
    <>
      <header>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/apptime-logo.svg"
          alt="App time logo"
          width={50}
          height={50}
        />
        <Text as="h1" variants="title" classes="text-center text-6xl">
          App Time home
        </Text>
      </header>
      <main className="flex h-[100dvh] flex-col items-center justify-center p-2">
        {children}
      </main>
    </>
  );
}

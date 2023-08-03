import { Background, Button, Input, Notify, Text } from "@/components";
import { FC, ReactElement } from "react";

interface Props {}

function NoScreenCompatibility(): ReactElement<FC<Props>> {
  return (
    <section className="grid grid-cols-2 grid-rows-6 gap-4">
      <nav className="flex flex-col gap-1 row-start-1 row-end-2 col-start-2 items-end">
        <Text as="h1" variants="title">
          No screen
          <Text
            as="span"
            variants="gradient"
            classes="from-red-300 via-red-500 to-red-700 text-4xl font-bold animate-text"
          >
            compatibility
          </Text>
        </Text>
        <Text as="p" variants="default">
          This app is only available for mobile devices
        </Text>
      </nav>
      <Notify />

      <Background
        img="/assets/mobile-only.webp"
        classes="w-[95%] -rotate-6 justify-self-center col-start-1 row-start-1 row-end-6"
      />
      <Background.waveBack classes="absolute -z-10 top-48 right-0" />

      <Background.waveFront classes="absolute bottom-0 h-fit left-0" />
    </section>
  );
}

export default NoScreenCompatibility;

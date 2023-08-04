import { Background, Button, Input, Notify, Text } from "@/components";
import { FC, ReactElement } from "react";

interface Props {}

function NoScreenCompatibility(): ReactElement<FC<Props>> {
  return (
    <section className="grid grid-cols-2 grid-rows-6 gap-4">
      <nav className="col-start-2 row-start-1 row-end-2 flex flex-col items-end gap-1">
        <Text as="h1" variants="title">
          No screen
          <Text
            as="span"
            variants="gradient"
            classes="animate-text from-red-300 via-red-500 to-red-700 text-4xl font-bold"
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
        classes="col-start-1 row-start-1 row-end-6 w-[95%] -rotate-6 justify-self-center"
      />
      <Background.waveBack classes="absolute right-0 top-48 -z-10" />

      <Background.waveFront classes="absolute bottom-0 left-0 h-fit" />
    </section>
  );
}

export default NoScreenCompatibility;

import { Background, Button, Input, Text } from "@/components";
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
      <div className="w-4/5 mt-auto px-8 py-4 bg-gray-700 rounded-lg space-y-8 col-start-2 row-start-3 justify-self-end">
        <Text classes="text-white text-lg">
          Do you want to get notice when the app is available for desktop?
        </Text>
        <div className="flex gap-2 justify-between">
          <Input variants="default" placeholder="username@email.com" />
          <Button variants="gradient" classes="p-1 animate-text">
            <div className="flex w-full py-1 px-3 items-center justify-center bg-gray-800 rounded-[inherit] hover:bg-gray-900 transition-all">
              <Text classes="font-black text-white">Notify Me</Text>
            </div>
          </Button>
        </div>
      </div>

      <Background
        img="/assets/mobile-only.webp"
        classes="aspect-square w-[37rem] absolute left-0 -rotate-12 justify-self-center"
      />
      <Background.waves classes="absolute -z-10 right-0" />
    </section>
  );
}

export default NoScreenCompatibility;

import Background from "@/components/Background";
import Suscribe from "@/components/Suscribe";
import Text from "@/components/ui/Text";

import { GRADIENTS } from "@/utils/constants/tailwind";

function NoScreenCompatibility() {
  return (
    <section className="grid h-full w-full grid-cols-2 grid-rows-4">
      <aside className="z-50 col-start-2 row-start-1 row-end-[-1] flex flex-col items-end justify-between gap-1">
        <nav className="flex flex-col items-end gap-1">
          <Text as="h1" variant="title">
            No screen
            <Text
              as="span"
              variant="gradient"
              classes={`animate-text  text-4xl font-bold ${GRADIENTS.error}`}
            >
              compatibility
            </Text>
          </Text>
          <Text as="p" variant="default">
            This app is only available for mobile devices
          </Text>
        </nav>
        <div className="w-[40rem]">
          <Suscribe />
        </div>
      </aside>

      <Background
        img="/assets/mobile-only.webp"
        classes="absolute col-start-1 col-end-1 row-start-1 row-end-4 w-auto -rotate-6 justify-self-center"
        width="w-[60rem]"
      />
      <Background.waveBack classes="absolute right-0 top-48 -z-10" />

      <Background.waveFront classes="absolute bottom-0 left-0 h-fit" />
    </section>
  );
}

export default NoScreenCompatibility;

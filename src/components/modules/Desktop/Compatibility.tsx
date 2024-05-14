import Background from "@/components/structures/Desktop/Background";
import Suscribe from "@/components/structures/Desktop/Suscribe";
import Text from "@/components/ui/Text";

function Compatibility() {
  return (
    <section className="grid h-full w-full grid-cols-12 grid-rows-6">
      <nav className="col-start-8 col-end-[-1] row-start-1 row-end-3 flex flex-col items-end gap-1">
        <Text as="h1" variant="title" classes="text-clamp-1-to-2.5">
          No screen{" "}
          <Text
            as="span"
            gradient="error"
            classes="animate-text text-clamp-1-to-2.5 font-bold text-transparent"
          >
            compatibility
          </Text>
        </Text>
        <Text as="p" variant="default">
          This app is only available for mobile devices
        </Text>
      </nav>

      <section className="z-50 col-start-8 col-end-[-1] row-auto w-[40rem] justify-self-end 2xl:row-start-5">
        <Suscribe />
      </section>

      <Background
        img="/assets/mobile-only.webp"
        classes="col-start-1 col-end-5 row-start-1 row-end-6 aspect-square h-fit w-fit -rotate-6 2xl:col-start-2 2xl:col-end-6 2xl:row-start-2"
        width="w-[60rem]"
      />
      <Background.waveBack classes="absolute right-0 top-48 -z-10" />

      <Background.waveFront classes="absolute bottom-0 left-0 h-fit" />
    </section>
  );
}

export default Compatibility;

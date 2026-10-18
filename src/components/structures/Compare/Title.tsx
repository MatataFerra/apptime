import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

function Title() {
  return (
    <Stack as="article" orientation="vertical" spacing={2} classes="w-full">
      <Stack
        as="div"
        orientation="horizontal"
        alignItems="center"
        justifyContent="center"
        classes="w-full text-pretty"
        spacing={1}
      >
        <Text
          variant="subtitle"
          classes="translate-x-[-300%] transform animate-show-left text-lg uppercase text-wine transition-all delay-700"
        >
          Production
        </Text>
        <Text classes="font-bold italic">vs.</Text>
        <Text
          variant="subtitle"
          classes="translate-x-[300%] animate-show-right text-lg uppercase text-lake transition-all delay-1000"
        >
          Hourly
        </Text>
      </Stack>
      <Text classes="mx-auto my-0 w-3/4 text-pretty text-center text-[0.5rem]">
        Compare wages to see which option is{" "}
        <Text as="span" classes="underline">
          better
        </Text>
      </Text>
    </Stack>
  );
}

export default Title;

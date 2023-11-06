import Buttons from "@/components/FormHome/Button";
import Content from "@/components/FormHome/Content";
import Stack from "@/components/ui/Stack";
import Stepper from "@/components/ui/Stepper";

export default async function Form() {
  return (
    <Stack grid classes="grid-cols-1 grid-rows-[auto,60%,40%]">
      <Stepper />
      <Content />
      <Buttons />
    </Stack>
  );
}

import FormHomeButton from "@/components/FormHome/Button";
import FormHomeContent from "@/components/FormHome/Content";
import Stack from "@/components/ui/Stack";
import Stepper from "@/components/ui/Stepper";

export default async function Form() {
  return (
    <Stack grid classes="grid-rows-[auto,60%,40%]">
      <Stepper />
      <FormHomeContent />
      <FormHomeButton />
    </Stack>
  );
}

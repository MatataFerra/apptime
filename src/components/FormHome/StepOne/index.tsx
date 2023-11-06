import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";

function StepOne() {
  return (
    <>
      <Stack orientation="vertical" classes="mt-16" spacing={8}>
        <Input label="name" labelClasses="text-sm" />
        <Input label="surname" labelClasses="text-sm" />
      </Stack>
    </>
  );
}

export default StepOne;

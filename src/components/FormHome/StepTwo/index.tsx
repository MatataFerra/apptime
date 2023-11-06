import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

function StepTwo() {
  return (
    <Stack orientation="vertical" classes="mt-4">
      <Stack spacing={8} classes="mb-10">
        <Input isRequired type="number" label="Hour value" measure="$" measurePlace="left" />
        <Input
          type="number"
          label="Extra for shift?"
          description="By default is 0"
          measure="$"
          measurePlace="left"
        />
      </Stack>

      <Stack orientation="horizontal">
        <Text classes="font-bold">When you start and finish your shift?</Text>
      </Stack>
      <Stack classes="w-3/4">
        <Input isRequired type="time" label="Start time" />
        <Input isRequired type="time" label="Finish time" />
      </Stack>
    </Stack>
  );
}

export default StepTwo;

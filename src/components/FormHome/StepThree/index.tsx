import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

function StepThree() {
  return (
    <>
      <Stack grid classes="grid-cols-2">
        <Stack as="div" orientation="vertical">
          <Text classes="font-bold">Night shift? *</Text>
          <Stack as="fieldset">
            <Input
              label="yes"
              containerClasses="items-center "
              labelClasses="order-2"
              type="radio"
              name="night"
              id="night-yes"
              classes="input_control order-1"
            />
            <Input
              label="no"
              containerClasses="items-center "
              labelClasses="order-2"
              type="radio"
              name="night"
              id="night-no"
              classes="input_control order-1"
            />
          </Stack>
        </Stack>
        <Stack>
          <Input type="number" label="value of night hour" measure="$" measurePlace="left" />
        </Stack>
      </Stack>
    </>
  );
}

export default StepThree;

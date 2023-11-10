import RadioWithInput from "@/components/RadioWithInput";
import RadioWithInputBreaks from "@/components/RadioWithInput/breaks";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

function StepThree() {
  return (
    <>
      <Stack grid classes="w-full grid-cols-1" spacing={4}>
        <RadioWithInput
          radioLabel="Night shift?"
          isRadioRequired
          radioGroupName="night"
          inputLabel="value of night hour"
          measure="$"
          measurePlace="left"
        />
        <RadioWithInput
          radioLabel="Holiday pay?"
          isRadioRequired
          radioGroupName="pay"
          inputLabel="rate of holiday pay"
          measure="%"
          measurePlace="right"
          inputDescription="By default is 8%"
        />
        <RadioWithInputBreaks />
      </Stack>
    </>
  );
}

export default StepThree;

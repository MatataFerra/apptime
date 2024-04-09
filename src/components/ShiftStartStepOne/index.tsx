import ShiftStartPublicHolidaysButtons from "@/components/ShiftStartPublicHolidaysButtons";
import Text from "@/components/ui/Text";

function ShiftStartStepOne() {
  return (
    <>
      <Text variant="subtitle" classes="text-center">
        Is this a public holiday?
      </Text>
      <ShiftStartPublicHolidaysButtons />
    </>
  );
}

export default ShiftStartStepOne;

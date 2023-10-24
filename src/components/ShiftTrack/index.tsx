import ShiftInfo from "@/components/ShiftInfo";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

function ShiftTrack() {
  return (
    <>
      <Stack
        orientation="vertical"
        classes="h-full self-start"
        alignItems="start"
        justifyContent="between"
      >
        <Text classes="text-2xl">No shift is tracked</Text>
        <ShiftInfo />
      </Stack>
    </>
  );
}

export default ShiftTrack;

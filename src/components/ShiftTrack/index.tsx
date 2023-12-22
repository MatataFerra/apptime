import ShiftInfo from "@/components/ShiftInfo";
import ShiftTrackTitle from "@/components/ShiftTrackTitle";
import Stack from "@/components/ui/Stack";

function ShiftTrack() {
  return (
    <>
      <Stack
        orientation="vertical"
        classes="h-full w-full self-start"
        alignItems="start"
        justifyContent="between"
      >
        <ShiftTrackTitle />
        <ShiftInfo />
      </Stack>
    </>
  );
}

export default ShiftTrack;

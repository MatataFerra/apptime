import ShiftTrackInfo from "@/components/ShiftTrackInfo";
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
        <ShiftTrackInfo />
      </Stack>
    </>
  );
}

export default ShiftTrack;

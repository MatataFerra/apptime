import ShiftRecorded from "@/components/ShiftRecorded";
import UnfilledForm from "@/components/ShiftStatus/UnfilledForm";
import ShiftTrack from "@/components/ShiftTrack";
import Stack from "@/components/ui/Stack";

function Status() {
  return (
    <Stack
      orientation="vertical"
      alignItems="center"
      classes="border_dash min-h-[25dvh] w-full justify-center p-4"
      spacing={6}
      justifyContent="center"
    >
      <UnfilledForm />
      {/* <ShiftTrack /> */}
      {/* <ShiftRecorded /> */}
    </Stack>
  );
}

export default Status;

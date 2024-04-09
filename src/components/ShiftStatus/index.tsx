import ShiftTrack from "@/components/ShiftTrack";
import Stack from "@/components/ui/Stack";

function ShiftStatus() {
  return (
    <Stack
      orientation="vertical"
      alignItems="center"
      classes="border_dash min-h-[25dvh] w-full justify-center p-4"
      spacing={6}
      justifyContent="center"
    >
      <ShiftTrack />
    </Stack>
  );
}

export default ShiftStatus;

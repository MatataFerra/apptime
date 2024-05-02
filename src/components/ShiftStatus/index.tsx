import ShiftTrack from "@/components/ShiftTrack";
import Stack from "@/components/ui/Stack";

function ShiftStatus() {
  return (
    <Stack
      orientation="vertical"
      alignItems="center"
      classes="h-fit min-h-[30dvh] w-full justify-center bg-gradient-to-br from-white via-slate-100 to-slate-300 p-4 shadow-input"
      spacing={6}
      justifyContent="center"
    >
      <ShiftTrack />
    </Stack>
  );
}

export default ShiftStatus;

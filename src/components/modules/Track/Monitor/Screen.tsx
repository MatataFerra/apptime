import Tracker from "@/components/modules/Track/Monitor/Tracker";
import Stack from "@/components/ui/Stack";

function Screen() {
  return (
    <Stack
      orientation="vertical"
      alignItems="center"
      classes="h-full min-h-[30dvh] w-full justify-center bg-gradient-to-br from-white via-slate-100 to-slate-300 p-4 shadow-input"
      spacing={6}
      justifyContent="center"
    >
      <Tracker />
    </Stack>
  );
}

export default Screen;

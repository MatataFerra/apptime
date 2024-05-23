import dynamic from "next/dynamic";

import ShiftInfo from "@/components/structures/Track/Monitor/ShiftInfo";
import Stack from "@/components/ui/Stack";

const ShiftState = dynamic(() => import("@/components/structures/Track/Monitor/ShiftState"), {
  ssr: false,
});

function Tracker() {
  return (
    <>
      <Stack
        orientation="vertical"
        classes="h-full w-full self-start"
        alignItems="start"
        justifyContent="between"
      >
        <ShiftState />
        <ShiftInfo />
      </Stack>
    </>
  );
}

export default Tracker;

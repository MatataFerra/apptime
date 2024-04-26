import dynamic from "next/dynamic";

import ShiftTrackInfo from "@/components/ShiftTrackInfo";
import Stack from "@/components/ui/Stack";

const ShiftTrackTitle = dynamic(() => import("@/components/ShiftTrackTitle"), {
  ssr: false,
});

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

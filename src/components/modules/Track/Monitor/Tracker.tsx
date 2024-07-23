import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

const ShiftState = dynamic(() => import("@/components/structures/Track/Monitor/ShiftState"), {
  ssr: false,
  loading: () => <Skeleton classes="h-10 w-3/4" />,
});

const ShiftInfo = dynamic(() => import("@/components/structures/Track/Monitor/ShiftInfo"), {
  ssr: false,
});

function Tracker() {
  return (
    <>
      <ShiftState />
      <ShiftInfo />
    </>
  );
}

export default Tracker;

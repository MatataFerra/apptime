import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

const MonitorScreen = dynamic(() => import("@/components/modules/Track/Monitor/Screen"), {
  ssr: false,
  loading: () => <Skeleton classes="h-monitor w-full rounded-3xl" />,
});

const ShiftTools = dynamic(() => import("@/components/structures/Track/Fab"), {
  ssr: false,
});

export default async function MonitorPage() {
  return (
    <>
      <MonitorScreen />
      <ShiftTools />
    </>
  );
}

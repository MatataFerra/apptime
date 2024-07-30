import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

const MonitorScreen = dynamic(() => import("@/components/modules/Track/Monitor/Screen"), {
  ssr: false,
  loading: () => <Skeleton classes="h-monitor w-full" />,
});

const FabMenu = dynamic(() => import("@/components/structures/Track/Fab"), {
  ssr: false,
  loading: () => <Skeleton classes="absolute bottom-24 right-2 z-50 size-16 rounded-full p-2" />,
});

export const maxDuration = 15;

export default async function MonitorPage() {
  return (
    <>
      <MonitorScreen />
      <FabMenu />
    </>
  );
}

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

const MonitorScreen = dynamic(() => import("@/components/modules/Track/Monitor/Screen"), {
  ssr: false,
  loading: () => <Skeleton classes="h-[50dvh] w-full" />,
});

export default async function MonitorPage() {
  return <MonitorScreen />;
}

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

const State = dynamic(() => import("@/components/structures/Track/State"), {
  ssr: false,
  loading: () => <Skeleton classes="h-12 w-1/3" />,
});

const MonitorScreen = dynamic(() => import("@/components/modules/Track/Monitor/Screen"), {
  ssr: false,
  loading: () => <Skeleton classes="h-[50dvh] w-full" />,
});

export default async function ScreenPage() {
  return <State />;
}

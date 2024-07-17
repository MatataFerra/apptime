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

const Buttons = dynamic(() => import("@/components/modules/Track/Buttons"), {
  ssr: false,
  loading: () => (
    <Stack classes="h-fit w-full" spacing={10} alignItems="center" justifyContent="between">
      <Skeleton classes="h-12 w-full" />
      <Skeleton classes="h-12 w-full" />
    </Stack>
  ),
});

export default async function MonitorTrackPage() {
  return (
    <Stack orientation="vertical" justifyContent="between" classes="h-[65dvh] w-full" spacing={8}>
      <Stack as="div" orientation="vertical" classes="h-full w-full">
        <State />
        <MonitorScreen />
      </Stack>
      <Buttons />
    </Stack>
  );
}

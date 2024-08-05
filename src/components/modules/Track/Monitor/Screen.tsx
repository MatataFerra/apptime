import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

const Tracker = dynamic(() => import("@/components/modules/Track/Monitor/Tracker"), {
  ssr: false,
  loading: () => (
    <Stack orientation="vertical" classes="h-full w-full" spacing={8}>
      <Skeleton classes="h-10 w-3/4" />
      <Skeleton classes="h-full w-full" />
    </Stack>
  ),
});

function Screen() {
  return (
    <Stack
      as="article"
      orientation="vertical"
      alignItems="start"
      classes="h-monitor w-full bg-gradient-to-br from-white via-slate-100 to-slate-300 p-4 shadow-input"
      spacing={6}
      justifyContent="between"
    >
      <Tracker />
    </Stack>
  );
}

export default Screen;

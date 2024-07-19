import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

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
  return <Buttons />;
}

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

const TableHistory = dynamic(() => import("@/components/modules/Dashboard/TableHistory"), {
  ssr: false,
  loading: () => (
    <Stack
      orientation="vertical"
      classes="h-fit max-h-60 min-h-60 w-full overflow-y-scroll rounded-lg border border-border bg-surface"
    >
      <Skeleton classes="h-full w-full" />
    </Stack>
  ),
});

export default async function TablePage() {
  return (
    <Stack
      orientation="vertical"
      classes="h-fit max-h-60 min-h-60 w-full overflow-y-scroll rounded-lg border border-border bg-surface"
    >
      <TableHistory />
    </Stack>
  );
}

import Stack from "@/components/ui/Stack";

import { TableHistory } from "./lazy";

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

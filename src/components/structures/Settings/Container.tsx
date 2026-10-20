import { PropsWithChildren } from "react";

import Stack from "@/components/ui/Stack";

type Props = {};

function Container({ children }: PropsWithChildren<Props>) {
  return (
    <Stack
      as="article"
      orientation="vertical"
      classes="w-full rounded-xl border border-border bg-surface px-1 py-0.5"
    >
      {children}
    </Stack>
  );
}

export default Container;

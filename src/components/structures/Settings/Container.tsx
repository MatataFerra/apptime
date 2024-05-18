import { PropsWithChildren } from "react";

import Stack from "@/components/ui/Stack";

type Props = {};

function Container({ children }: PropsWithChildren<Props>) {
  return (
    <Stack
      as="article"
      orientation="vertical"
      classes="w-full rounded-lg border border-stone-300/40 p-2 shadow-md"
    >
      {children}
    </Stack>
  );
}

export default Container;

import type { ReactElement } from "react";

import Stack from "@/components/ui/Stack";

type Props = {
  children: ReactElement | ReactElement[];
};

function Card({ children }: Props) {
  return (
    <Stack
      grid
      rows={2}
      orientation="vertical"
      classes="h-32 min-h-32 rounded-lg border border-border bg-surface p-4"
    >
      {children}
    </Stack>
  );
}

export default Card;

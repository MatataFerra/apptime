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
      classes="h-40 min-h-40 rounded-lg border border-gray-200 p-2 shadow-input"
    >
      {children}
    </Stack>
  );
}

export default Card;

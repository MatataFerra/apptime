import type { PropsWithChildren, ReactNode } from "react";

import Modes from "@/components/structures/Production/Modes";
import Stack from "@/components/ui/Stack";

interface Props {
  form: ReactNode;
}

export default async function ProdctionLayout({ children, form }: PropsWithChildren<Props>) {
  return (
    <Stack orientation="vertical" spacing={6}>
      {children}
      <Modes single={form} />
    </Stack>
  );
}

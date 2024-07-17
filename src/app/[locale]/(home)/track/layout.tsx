import type { ReactNode } from "react";

import Stack from "@/components/ui/Stack";

type Props = {
  children: ReactNode;
  monitor: ReactNode;
};

export default function Layout({ children, monitor }: Props) {
  return (
    <Stack orientation="vertical" spacing={8}>
      {children}
      {monitor}
    </Stack>
  );
}

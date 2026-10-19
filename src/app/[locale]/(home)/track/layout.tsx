import type { PropsWithChildren, ReactNode } from "react";

import Stack from "@/components/ui/Stack";

import { State } from "./lazy";

type Props = {
  screen: ReactNode;
  start: ReactNode;
};

export default async function Layout({ children, start, screen }: PropsWithChildren<Props>) {
  return (
    <Stack orientation="vertical" spacing={6}>
      {children}
      <Stack orientation="vertical" classes="w-full" spacing={4}>
        <State />
        {screen}
        {start}
      </Stack>
    </Stack>
  );
}

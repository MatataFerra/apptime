import type { PropsWithChildren, ReactElement } from "react";

import Stack from "@/components/ui/Stack";

interface ScreenLayoutProps {
  monitor: ReactElement;
}

export default async function ScreenLayout({
  children,
  monitor,
}: PropsWithChildren<ScreenLayoutProps>) {
  return (
    <Stack as="div" orientation="vertical" classes="h-full w-full">
      {children}
      {monitor}
    </Stack>
  );
}

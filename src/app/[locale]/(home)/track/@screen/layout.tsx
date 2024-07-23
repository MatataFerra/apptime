import type { PropsWithChildren, ReactElement } from "react";

import Stack from "@/components/ui/Stack";

interface ScreenLayoutProps {
  tracker: ReactElement;
}

export default async function ScreenLayout({
  children,
  tracker,
}: PropsWithChildren<ScreenLayoutProps>) {
  return (
    <Stack as="div" orientation="vertical" classes="h-full w-full">
      {children}
      {tracker}
    </Stack>
  );
}

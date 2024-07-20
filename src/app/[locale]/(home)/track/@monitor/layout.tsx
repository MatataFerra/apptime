import type { PropsWithChildren, ReactElement } from "react";

import Stack from "@/components/ui/Stack";

interface MonitorLayoutProps {
  screen: ReactElement;
}

export default async function MonitorLayout({
  children,
  screen,
}: PropsWithChildren<MonitorLayoutProps>) {
  return (
    <Stack orientation="vertical" justifyContent="between" classes="h-[65dvh] w-full" spacing={8}>
      {screen}
      {children}
    </Stack>
  );
}

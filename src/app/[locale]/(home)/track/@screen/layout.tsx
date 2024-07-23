"use client";

import type { PropsWithChildren, ReactElement } from "react";

import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import useTrack from "@/hooks/useTrack";

interface ScreenLayoutProps {
  tracker: ReactElement;
}

export default function ScreenLayout({ children, tracker }: PropsWithChildren<ScreenLayoutProps>) {
  const { isShiftActive } = useTrack();

  return (
    <Stack as="div" orientation="vertical" classes="h-full w-full">
      {children}
      {isShiftActive ? (
        <>{tracker}</>
      ) : (
        <Stack
          as="article"
          orientation="vertical"
          alignItems="start"
          classes="h-full w-full bg-gradient-to-br from-white via-slate-100 to-slate-300 p-4 shadow-input"
          spacing={6}
          justifyContent="between"
        >
          <Text classes="block text-2xl underline">No shift is being tracked</Text>
        </Stack>
      )}
    </Stack>
  );
}

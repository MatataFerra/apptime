"use client";

import { useEffect } from "react";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import useTrack from "@/hooks/useTrack";

const State = dynamic(() => import("@/components/structures/Track/State"), {
  ssr: false,
  loading: () => <Skeleton classes="h-12 w-1/3" />,
});

export default function ScreenPage() {
  const router = useRouter();
  const { isShiftActive } = useTrack();
  useEffect(() => {
    if (isShiftActive) {
      router.replace("/track/tracker");
    }
  }, [isShiftActive, router]);

  return (
    <Stack as="div" orientation="vertical" classes="h-full w-full">
      <Stack
        as="article"
        orientation="vertical"
        alignItems="start"
        classes="h-full w-full bg-gradient-to-br from-white via-slate-100 to-slate-300 p-4 shadow-input"
        spacing={6}
        justifyContent="between"
      >
        <div className="flex h-full w-full flex-col items-center justify-center space-y-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Loading...</h1>
        </div>
      </Stack>
    </Stack>
  );
}

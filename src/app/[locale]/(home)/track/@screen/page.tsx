"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import Image from "@/components/ui/Image";
import Stack from "@/components/ui/Stack";

import useTrack from "@/hooks/useTrack";

export const dynamic = "force-static";

export default function ScreenPage() {
  const router = useRouter();
  const { isShiftActive } = useTrack();

  useEffect(() => {
    if (isShiftActive) {
      router.replace("/track/tracker");
    }
  }, [isShiftActive, router]);

  return null;
}

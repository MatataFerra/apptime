"use client";

import { type PropsWithChildren, useEffect } from "react";

import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";

import useTrack from "@/hooks/useTrack";

export default function ButtonsPage() {
  const router = useRouter();
  const { isShiftActive } = useTrack();

  useEffect(() => {
    if (isShiftActive) return;

    router.replace("/track/button");
  }, [isShiftActive, router]);

  return null;
}

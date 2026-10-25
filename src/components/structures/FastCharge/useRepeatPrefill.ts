"use client";

import { useEffect, useRef } from "react";

import { useSearchParams } from "next/navigation";

import { movedToDay } from "@/services/Repeat";

import type { HourlyType } from "@/types";

import { PATH_NAMES } from "@/utils/constants/pathnames";

import { useRouter } from "@/i18n/navigation";

/**
 * "?repeat=12": fills the form with that shift moved to today (what the
 * home's "Same as Friday?" card would save), so "Edit" there lands on a
 * ready form. Applied once; the param is then dropped from the URL so a
 * reload or a second shift starts clean.
 */
function useRepeatPrefill(
  hourly: HourlyType[] | undefined | null,
  apply: (shift: HourlyType, start: Date, end: Date) => void
) {
  const params = useSearchParams();
  const router = useRouter();
  const id = Number(params.get("repeat"));
  const done = useRef(false);
  const applyRef = useRef(apply);
  useEffect(() => {
    applyRef.current = apply;
  });

  useEffect(() => {
    if (done.current || !Number.isInteger(id) || id <= 0 || !hourly) return;
    done.current = true;
    const shift = hourly.find((s) => s.id === id);
    const moved = shift ? movedToDay(shift) : null;
    if (shift && moved) applyRef.current(shift, moved.start, moved.end);
    router.replace(PATH_NAMES.FAST_CHARGE, { scroll: false });
  }, [id, hourly, router]);
}

export default useRepeatPrefill;

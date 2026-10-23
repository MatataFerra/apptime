"use client";

import { useState } from "react";

import { useLocale, useTranslations } from "next-intl";
import { useInterval } from "usehooks-ts";

import DateHumanizer from "@/services/Date";
import ShiftService from "@/services/Shift";
import { formatHours, runningShiftEarnings, usualShiftMinutes } from "@/services/Summary";

import useMoney from "@/hooks/useMoney";
import useTrack from "@/hooks/useTrack";

/**
 * Bottom of the monitor. While a shift runs: progress against the usual
 * shift length and what this shift has earned so far. Otherwise: the last
 * shift and the usual length.
 */
function ShiftTrackInfo() {
  const money = useMoney();
  const t = useTranslations("track.monitor");
  const locale = useLocale();
  const { user, isShiftActive, isClosing, shiftUnclosed } = useTrack();
  const [now, setNow] = useState(() => new Date());
  const running = isShiftActive && !isClosing && !!shiftUnclosed.shift?.startDate;

  useInterval(() => setNow(new Date()), running ? 5000 : null);

  const hourly = user?.shifts?.hourly ?? [];
  const usual = usualShiftMinutes(hourly);
  const lastClosed = hourly
    .filter((s) => s.isClosed)
    .sort((a, b) => new Date(a.startDate).valueOf() - new Date(b.startDate).valueOf())
    .at(-1);
  const lastLabel = lastClosed?.startDate
    ? new DateHumanizer("long").humanizeDate(new Date(lastClosed.startDate), { locale })
    : t("none_yet");

  if (running) {
    const elapsed = ShiftService.differenceInHHmm(shiftUnclosed.shift?.startDate ?? "", "").diff;
    const progress = usual ? Math.min(100, Math.round((elapsed / usual) * 100)) : null;
    const earned = runningShiftEarnings(shiftUnclosed.shift, now);

    return (
      <div className="flex flex-col gap-4">
        {progress !== null ? (
          <div
            className="h-2 overflow-hidden rounded-full bg-ink-inverse/12"
            role="progressbar"
            aria-label={t("progress")}
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-live transition-[width] duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}
        <dl className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-ink-inverse/60">{t("so_far")}</dt>
            <dd className="figure text-[1.625rem] leading-tight text-live">
              {money(earned, { currency: shiftUnclosed.shift?.currency })}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-ink-inverse/60">{t("usual")}</dt>
            <dd className="figure text-[1.625rem] leading-tight">
              {usual ? formatHours(usual) : "–"}
            </dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <dl className="grid grid-cols-2 gap-3 border-t border-ink-inverse/15 pt-4">
      <div className="flex flex-col gap-0.5">
        <dt className="text-xs text-ink-inverse/60">{t("last")}</dt>
        <dd className="text-sm font-medium">{lastLabel}</dd>
      </div>
      <div className="flex flex-col gap-0.5">
        <dt className="text-xs text-ink-inverse/60">{t("usual")}</dt>
        <dd className="text-sm font-medium">{usual ? formatHours(usual) : t("after_three")}</dd>
      </div>
    </dl>
  );
}

export default ShiftTrackInfo;

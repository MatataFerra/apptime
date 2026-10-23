"use client";

import { useState } from "react";

import { ChevronRight, LoaderCircle, Square } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useInterval } from "usehooks-ts";

import { runningShiftEarnings } from "@/services/Summary";

import { PATH_NAMES } from "@/utils/constants/pathnames";
import useFinishShift from "@/hooks/useFinishShift";
import useHourlyShifts from "@/hooks/useHourlyShifts";
import useMoney from "@/hooks/useMoney";

import { Link } from "@/i18n/navigation";

function elapsed(start: Date, now: Date) {
  const minutes = Math.max(0, Math.floor((now.valueOf() - start.valueOf()) / 60000));
  return { hours: Math.floor(minutes / 60), mins: minutes % 60 };
}

/**
 * Shown on Home only while a tracked shift is running: how long it's been,
 * what it's worth so far, and a way to finish it without opening Track.
 */
function LiveShift() {
  const money = useMoney();
  const t = useTranslations("home.live");
  const locale = useLocale();
  const { data: hourly } = useHourlyShifts();
  const { finish, finishing } = useFinishShift();
  const [now, setNow] = useState(() => new Date());
  const [confirming, setConfirming] = useState(false);
  // Hidden as soon as the save succeeds, before the shift list refetches.
  const [closedId, setClosedId] = useState<number | null>(null);
  const running = hourly?.find((shift) => !shift.isClosed);

  useInterval(() => setNow(new Date()), running ? 15000 : null);
  // The confirmation step closes itself if it isn't used (never mid-save).
  useInterval(() => setConfirming(false), confirming && !finishing ? 6000 : null);

  if (!running?.startDate || running.id === closedId) return null;

  const start = new Date(running.startDate);
  if (isNaN(start.valueOf())) return null;

  const { hours, mins } = elapsed(start, now);
  const earned = runningShiftEarnings(running, now);
  function clock(date: Date) {
    return date.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
  }
  const startedAt = clock(start);

  return (
    <section
      data-testid="live-shift"
      aria-label={t("in_progress")}
      className="flex flex-col gap-3 rounded-xl bg-track p-4 text-on-module shadow-float"
    >
      <Link
        href={PATH_NAMES.TRACK}
        aria-label={t("open_track", { hours, mins })}
        className="group flex items-center gap-3.5 rounded-xl"
      >
        <span className="relative flex size-2.5 shrink-0" aria-hidden="true">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-live opacity-70 motion-reduce:animate-none dark:bg-on-module" />
          <span className="relative inline-flex size-2.5 rounded-full bg-live dark:bg-on-module" />
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[0.8125rem] font-medium text-on-module/75">
            {t("since", { time: startedAt })}
          </span>
          <span className="flex items-baseline gap-2.5">
            <span className="figure text-[1.75rem] leading-none">
              {hours}
              <span className="mr-[0.15em] text-[0.6em] text-on-module/60">h</span>
              {String(mins).padStart(2, "0")}
              <span className="text-[0.6em] text-on-module/60">m</span>
            </span>
            <span className="truncate text-sm text-on-module/80">
              {earned > 0
                ? t("so_far", { amount: money(earned, { currency: running.currency }) })
                : running.name || t("hourly_shift")}
            </span>
          </span>
        </span>

        <ChevronRight
          className="size-5 shrink-0 text-on-module/70 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>

      {finishing ? (
        <div
          role="status"
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-on-module/15 text-sm font-semibold"
        >
          <LoaderCircle
            className="size-4 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
          {t("saving")}
        </div>
      ) : confirming ? (
        <div className="grid grid-cols-2 gap-2" role="group" aria-label={t("confirm")}>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="h-11 rounded-xl bg-on-module/15 text-sm font-semibold transition-colors hover:bg-on-module/25"
          >
            {t("keep_going")}
          </button>
          <button
            type="button"
            onClick={async () => {
              setConfirming(false);
              if (await finish(running)) setClosedId(running.id);
            }}
            className="h-11 rounded-xl bg-surface text-sm font-semibold text-ink transition-transform active:scale-[0.98]"
          >
            {t("finish_at", { time: clock(now) })}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setNow(new Date());
            setConfirming(true);
          }}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-on-module/15 text-sm font-semibold transition-colors hover:bg-on-module/25"
        >
          <Square className="size-3.5 fill-current" aria-hidden="true" />
          {t("finish")}
        </button>
      )}
    </section>
  );
}

export default LiveShift;

"use client";

import { useCallback } from "react";

import { format } from "date-fns";
import { useTranslations } from "next-intl";

import ut from "@/services/Utilities/client";

import PopoverHome from "@/components/structures/Home/Popover";
import Text from "@/components/ui/Text";

import useDateLocale from "@/hooks/useDateLocale";
import useTrack from "@/hooks/useTrack";

function ShiftTextState() {
  const {
    shiftUnclosed: { shift },
  } = useTrack();
  const t = useTranslations("track.monitor");
  const locale = useDateLocale();

  const checkCloseShift = useCallback(() => {
    if (typeof shift?.isClosed === "undefined") {
      return false;
    }

    return ut.isFalsyValue(shift?.isClosed);
  }, [shift?.isClosed]);

  const online = checkCloseShift();
  const startedAt = shift?.startDate ? new Date(shift.startDate) : null;

  return (
    <div className="flex w-full items-center justify-between gap-3">
      <Text as="h2" classes="flex items-center gap-2 text-sm text-ink-muted">
        <span className="sr-only">{t("status")}</span>
        <Text
          as="span"
          classes={`inline-flex h-8 items-center gap-2 rounded-full border px-3 text-sm font-semibold ${
            online
              ? "border-track/25 bg-surface text-track"
              : "border-border bg-surface text-ink-muted"
          }`}
        >
          <span
            aria-hidden="true"
            className={`size-1.5 rounded-full ${online ? "bg-accent" : "bg-ink-subtle"}`}
          />
          {online ? t("on") : t("off")}
        </Text>
        <PopoverHome />
      </Text>
      {online && startedAt && !isNaN(startedAt.valueOf()) ? (
        <span className="text-sm text-ink-muted">
          {t("started", {
            time: format(startedAt, "p", { locale }),
          })}
        </span>
      ) : null}
    </div>
  );
}

export default ShiftTextState;

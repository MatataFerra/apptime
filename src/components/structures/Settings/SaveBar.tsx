"use client";

import { useEffect, useRef, useState } from "react";

import { LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/Button";

import { cn } from "@/utils/helpers/styleMerger";
import useSettingsChanges from "@/hooks/useSettingsChanges";

/**
 * "Save changes" for the whole Settings page. It sits after "Your details";
 * while there are unsaved changes and that spot is off screen, the same
 * button floats at the bottom, and it docks back into place as you reach it.
 */
function SaveBar() {
  const t = useTranslations("settings.changes");
  const { dirty, saving, save, discard } = useSettingsChanges();
  const anchor = useRef<HTMLDivElement>(null);
  const [docked, setDocked] = useState(true);

  useEffect(() => {
    const node = anchor.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setDocked(entry.isIntersecting), {
      threshold: 0.6,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const label = saving ? (
    <>
      <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
      {t("saving")}
    </>
  ) : (
    t("save")
  );

  return (
    <>
      <div ref={anchor} className="flex flex-col gap-2">
        <Button
          type="button"
          variant="primary"
          size="lg"
          classes="w-full rounded-2xl"
          disabled={!dirty || saving}
          onClick={save}
        >
          {label}
        </Button>
        {dirty ? (
          <button
            type="button"
            onClick={discard}
            disabled={saving}
            className="mx-auto rounded-md px-2 py-1 text-sm text-ink-muted hover:text-ink"
          >
            {t("discard")}
          </button>
        ) : null}
      </div>

      {dirty && !docked ? (
        <div
          role="region"
          aria-label={t("unsaved")}
          className={cn(
            "fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
            "animate-in duration-200 fade-in slide-in-from-bottom-4"
          )}
        >
          <div className="mx-auto flex max-w-md items-center gap-2 rounded-2xl bg-surface-inverse p-2 pl-4 text-ink-inverse shadow-lg">
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{t("unsaved")}</span>
            <button
              type="button"
              onClick={discard}
              disabled={saving}
              className="shrink-0 rounded-xl px-3 py-2.5 text-sm text-ink-inverse/75 hover:text-ink-inverse"
            >
              {t("discard")}
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-live px-4 py-2.5 text-sm font-semibold text-on-live disabled:opacity-70"
            >
              {saving ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
              {saving ? t("saving") : t("save")}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default SaveBar;

"use client";

import { useSyncExternalStore } from "react";

import { ChartColumn, Package, Smartphone, Timer } from "lucide-react";
import { useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";

import PhonePreview from "@/components/structures/Desktop/PhonePreview";
import Suscribe from "@/components/structures/Desktop/Suscribe";
import { LogoMark } from "@/components/ui/Logo";

import { MODULE_THEMES, type ModuleTheme } from "@/utils/constants/modules";
import { cn } from "@/utils/helpers/styleMerger";

const FEATURES: { key: string; theme: ModuleTheme; icon: typeof Timer }[] = [
  { key: "track", theme: "track", icon: Timer },
  { key: "pieces", theme: "production", icon: Package },
  { key: "pay", theme: "insight", icon: ChartColumn },
];

function subscribeToNothing() {
  return () => {};
}

function readOrigin() {
  return window.location.origin;
}

/**
 * Temporary landing for desktop browsers: the app only runs on phones,
 * so this explains it and hands the link over with a QR code.
 */
function Compatibility() {
  const t = useTranslations("no-mobile");
  const url = useSyncExternalStore(subscribeToNothing, readOrigin, () => "");

  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-background text-ink">
      <div
        aria-hidden="true"
        className="absolute -top-40 -right-32 -z-10 size-[38rem] rounded-full bg-track-soft blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-48 left-1/3 -z-10 size-[30rem] rounded-full bg-fast-soft blur-3xl"
      />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-8 py-5">
        <span className="flex items-center gap-2 text-ink">
          <LogoMark className="size-8" />
          <span className="font-logo text-2xl leading-none font-extrabold tracking-[-0.03em]">
            casualapp
          </span>
        </span>
        <span className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm font-medium text-ink-muted">
          {t("badge")}
        </span>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-16 px-8 pt-2 pb-12 lg:grid-cols-[minmax(0,1fr)_auto]">
        <section className="flex max-w-xl flex-col gap-7">
          <div className="flex flex-col gap-5">
            <span className="flex w-fit items-center gap-2 rounded-full bg-track-soft px-3 py-1.5 text-sm font-semibold text-track-ink">
              <Smartphone className="size-4" aria-hidden="true" />
              {t("eyebrow")}
            </span>
            <h1 className="display-title text-[clamp(3.25rem,5.2vw,5rem)] leading-[0.88] text-balance text-ink">
              {t("title")}
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-pretty text-ink-muted">
              {t("body")}
            </p>
          </div>

          <ul className="grid grid-cols-3 gap-3">
            {FEATURES.map(({ key, theme, icon: Icon }) => {
              const colors = MODULE_THEMES[theme];
              return (
                <li
                  key={key}
                  className={cn("flex flex-col gap-3 rounded-2xl p-4", colors.soft, colors.ink)}
                >
                  <Icon className="size-5" strokeWidth={2} aria-hidden="true" />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[0.9375rem] leading-tight font-semibold">
                      {t(`feature_${key}`)}
                    </span>
                    <span className="text-[0.8125rem] opacity-75">{t(`feature_${key}_hint`)}</span>
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-5 rounded-[24px] border border-border bg-surface p-5 shadow-float">
            <div className="flex size-32 shrink-0 items-center justify-center rounded-2xl bg-white p-2.5">
              {url ? (
                <QRCodeSVG
                  value={url}
                  size={108}
                  level="M"
                  marginSize={0}
                  fgColor="#14211c"
                  bgColor="#ffffff"
                  title={t("scan")}
                />
              ) : null}
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <h2 className="text-lg font-semibold text-ink">{t("scan")}</h2>
              <p className="text-[0.9375rem] text-ink-muted">{t("scan_hint")}</p>
              {url ? (
                <p className="truncate text-sm text-ink-muted">
                  {t("or_visit")}{" "}
                  <span className="font-semibold text-ink">{url.replace(/^https?:\/\//, "")}</span>
                </p>
              ) : null}
            </div>
          </div>

          <Suscribe />
        </section>

        <PhonePreview />
      </main>
    </div>
  );
}

export default Compatibility;

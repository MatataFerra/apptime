"use client";

import { useTranslations } from "next-intl";

export default function ErrorTracker() {
  const t = useTranslations("track.errors");

  return (
    <div className="h-monitor w-full">
      <div className="flex h-full w-full flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-2xl font-bold text-destructive">{t("title")}</h1>
        <p className="text-lg">{t("tracker")}</p>
      </div>
    </div>
  );
}

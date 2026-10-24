"use client";

import { useTranslations } from "next-intl";

export default function ErrorComponent() {
  const t = useTranslations("track.errors");

  return <div className="h-18 w-full text-destructive">{t("button")}</div>;
}

import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { SUPPORTED_LOCALES } from "@/utils/constants";
import { SITE_URL } from "@/utils/constants/site";
import { isLocale } from "@/utils/helpers/locale";

export const alt = "CasualApp";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

// Satori reads woff, not woff2: the wordmark's font, from its own package.
const schibsted = readFile(
  join(
    process.cwd(),
    "node_modules/@fontsource/schibsted-grotesk/files/schibsted-grotesk-latin-800-normal.woff"
  )
);

// Colours from globals.css: the inverse surface (the tracker monitor).
const INK = "#14211c";
const PAPER = "#f4f6f5";
const SUBTLE = "#8a9690";
const LIVE = "#13efa0";

/** The logo mark (components/ui/Logo), with the ring in `ring`. */
function Mark({ size, ring }: { size: number; ring: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <path
        d="M26.4 10 A12 12 0 1 0 26.4 22"
        stroke={ring}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M16 16 L16 9.5 M16 16 L20 18.5"
        stroke={LIVE}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** Shared-link card per locale: the wordmark and the app's one-line pitch. */
export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({
    locale: isLocale(locale) ? locale : "en",
    namespace: "metadata",
  });

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: INK,
        color: PAPER,
        fontFamily: "Schibsted Grotesk",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", right: -170, top: 40, display: "flex", opacity: 0.08 }}>
        <Mark size={620} ring={PAPER} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Mark size={76} ring={PAPER} />
        <span style={{ fontSize: 60, letterSpacing: "-0.03em", lineHeight: 1 }}>casualapp</span>
      </div>

      <div
        style={{
          display: "flex",
          maxWidth: 900,
          fontSize: 74,
          lineHeight: 1.05,
          letterSpacing: "-0.035em",
        }}
      >
        {t("description")}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, color: SUBTLE }}>
        <div style={{ width: 14, height: 14, borderRadius: 7, background: LIVE }} />
        {SITE_URL.host}
      </div>
    </div>,
    {
      ...size,
      fonts: [{ name: "Schibsted Grotesk", data: await schibsted, weight: 800, style: "normal" }],
    }
  );
}

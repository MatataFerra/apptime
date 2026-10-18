import {
  ArrowLeftRight,
  Calculator,
  ChartColumn,
  type LucideIcon,
  Package,
  Settings,
  Timer,
  Zap,
} from "lucide-react";

import { PATH_NAMES } from "@/utils/constants/pathnames";

/**
 * Colour family per module. Classes are written out in full so Tailwind
 * picks them up; `band` is the CSS variable the page header blends into.
 */
export const MODULE_THEMES = {
  track: {
    band: "var(--track-soft)",
    soft: "bg-track-soft",
    strong: "bg-track",
    ink: "text-track-ink",
    text: "text-track",
  },
  fast: {
    band: "var(--fast-soft)",
    soft: "bg-fast-soft",
    strong: "bg-fast",
    ink: "text-fast-ink",
    text: "text-fast",
  },
  production: {
    band: "var(--production-soft)",
    soft: "bg-production-soft",
    strong: "bg-production",
    ink: "text-production-ink",
    text: "text-production",
  },
  insight: {
    band: "var(--insight-soft)",
    soft: "bg-insight-soft",
    strong: "bg-insight",
    ink: "text-insight-ink",
    text: "text-insight",
  },
  neutral: {
    band: "var(--background)",
    soft: "bg-surface-sunken",
    strong: "bg-primary",
    ink: "text-ink-muted",
    text: "text-ink",
  },
} as const;

export type ModuleTheme = keyof typeof MODULE_THEMES;

export const MODULES: Record<string, { theme: ModuleTheme; icon: LucideIcon }> = {
  [PATH_NAMES.TRACK]: { theme: "track", icon: Timer },
  [PATH_NAMES.FAST_CHARGE]: { theme: "fast", icon: Zap },
  [PATH_NAMES.PRODUCTION]: { theme: "production", icon: Package },
  [PATH_NAMES.INCOMES]: { theme: "insight", icon: Calculator },
  [PATH_NAMES.COMPARE]: { theme: "insight", icon: ArrowLeftRight },
  [PATH_NAMES.DASHBOARD]: { theme: "insight", icon: ChartColumn },
  [PATH_NAMES.SETTINGS]: { theme: "neutral", icon: Settings },
};

/** Module for a pathname like `/en/track` or `/track/...`. */
export function moduleFromPath(pathname: string | null) {
  if (!pathname) return null;
  const segments = pathname.split("/").filter(Boolean);
  const key = Object.keys(MODULES).find((path) =>
    segments.some((segment) => `/${segment}` === path)
  );
  return key ? MODULES[key] : null;
}

import localFont from "next/font/local";

// Self-hosted variable fonts (no network needed at build time).
// Both ship tabular figures, which the clock and money amounts rely on.
export const figtree = localFont({
  src: "../../node_modules/@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2",
  variable: "--font-figtree",
  weight: "300 900",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const bricolage = localFont({
  src: "../../node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-standard-normal.woff2",
  variable: "--font-bricolage",
  weight: "200 800",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
  // full variable file: opsz, wdth and wght axes (titles use the condensed width)
  declarations: [{ prop: "font-stretch", value: "75% 100%" }],
});

// Logo wordmark only.
export const schibsted = localFont({
  src: "../../node_modules/@fontsource/schibsted-grotesk/files/schibsted-grotesk-latin-800-normal.woff2",
  variable: "--font-schibsted",
  weight: "800",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

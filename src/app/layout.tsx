import { ReactNode } from "react";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { cn } from "@/utils/helpers/styleMerger";
import { THEME_SCRIPT } from "@/utils/theme";

import "@/app/globals.css";

import { bricolage, figtree, schibsted } from "./fonts";

export const metadata = {
  title: "NomadShift",
  description: "Track your hours and see what you earn, shift by shift.",
};

async function Layout({ children }: { children: ReactNode }) {
  return (
    // The theme script sets the `dark` class before React hydrates.
    <html
      className={cn(figtree.variable, bricolage.variable, schibsted.variable)}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="bg-background font-sans text-ink">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

export default Layout;

import { ReactNode } from "react";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { cn } from "@/utils/helpers/styleMerger";

import "@/app/globals.css";

import { bricolage, figtree, schibsted } from "./fonts";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "de" }];
}

export const metadata = {
  title: "CasualApp",
  description: "Track your hours and see what you earn, shift by shift.",
};

async function Layout({ children }: { children: ReactNode }) {
  return (
    <html className={cn(figtree.variable, bricolage.variable, schibsted.variable)}>
      <body className="font-sans">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

export default Layout;

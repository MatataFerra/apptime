import React from "react";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { Poppins } from "next/font/google";

import { LocaleParams } from "@/types";

import { cn } from "@/utils/helpers/styleMerger";

import "@/app/globals.css";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "de" }];
}

export const metadata = {
  title: "App time!",
  description: "Track your time, and get things done!",
};

const poppinsFont = Poppins({
  weight: ["200", "400", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  fallback: ["system-ui"],
});

function Layout({ children, params }: { children: React.ReactNode; params: LocaleParams }) {
  return (
    <html lang={params.locale} className={cn(poppinsFont.className)}>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}

export default Layout;

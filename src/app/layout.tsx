import { ReactNode } from "react";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Poppins } from "next/font/google";

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
  preload: true,
});

async function Layout({ children }: { children: ReactNode }) {
  return (
    <html className={cn(poppinsFont.className)}>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

export default Layout;

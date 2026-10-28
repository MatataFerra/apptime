import { ReactNode } from "react";

import { SettingsDraftProvider } from "@/providers/SettingsDraft";

interface LayoutProps {
  children: ReactNode;
  body: ReactNode;
}

export default async function Layout({ children, body }: LayoutProps) {
  // Changes made here wait for "Save changes" (see SaveBar).
  return (
    <SettingsDraftProvider>
      {body}
      {children}
    </SettingsDraftProvider>
  );
}

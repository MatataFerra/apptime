"use client";

import type { CSSProperties, ReactNode } from "react";

import { usePathname } from "next/navigation";

import { MODULE_THEMES, moduleFromPath } from "@/utils/constants/modules";

/**
 * App frame for logged-in screens. Exposes the current module's tint as
 * `--band` so the sticky header and the module header read as one band.
 */
function ModuleShell({ header, children }: { header: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const mod = moduleFromPath(pathname);
  const band = mod && mod.theme !== "neutral" ? MODULE_THEMES[mod.theme].band : "var(--background)";

  return (
    <main
      vaul-drawer-wrapper=""
      className="grid h-full min-h-dvh grid-rows-[auto_1fr] bg-background *:px-4 *:pb-4"
      data-testid="drawer-close"
      style={{ "--band": band } as CSSProperties}
    >
      {header}
      {children}
    </main>
  );
}

export default ModuleShell;

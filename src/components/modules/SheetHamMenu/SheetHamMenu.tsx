"use client";

import type { PropsWithChildren } from "react";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import Login from "@/components/structures/Auth/Login";
import Logout from "@/components/structures/Auth/Logout";
import Ham from "@/components/structures/share/Ham";
import Options from "@/components/structures/SheetHamMenu/Options";
import { LogoMark } from "@/components/ui/Logo";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";

import { useAuthSession } from "@/providers/Session";

import { signOutAndLeave } from "@/utils/auth/client";
import { PATH_NAMES } from "@/utils/constants/pathnames";

import { useRouter } from "@/i18n/navigation";

type Props = {};

function SheetHamMenu({ children }: PropsWithChildren<Props>) {
  const router = useRouter();
  // With the locale, so login comes back to this same page and language.
  const path = usePathname();
  const t = useTranslations("nav");
  const { isSignedIn } = useAuthSession();

  function handleLogout() {
    signOutAndLeave(PATH_NAMES.HOME);
  }

  function handleLogin() {
    router.push(`${PATH_NAMES.LOGIN}?redirect=${encodeURIComponent(path)}`);
  }
  return (
    <Sheet>
      <SheetTrigger data-testid="ham" className="-ml-2 rounded-md">
        <Ham />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex w-[86%] flex-col gap-6 overflow-y-auto rounded-r-[28px] border-r-0 bg-surface px-4 pt-5 pb-6 sm:max-w-sm"
      >
        <SheetHeader className="gap-5 space-y-0 text-left">
          <span className="flex items-center gap-1.5 text-ink" aria-hidden="true">
            <LogoMark className="size-7" />
            <span className="font-logo text-[1.375rem] leading-none font-extrabold tracking-[-0.03em]">
              nomadshift
            </span>
          </span>
          <SheetTitle asChild>
            <div>{children}</div>
          </SheetTitle>
          <SheetDescription>
            <VisuallyHidden.Root>{t("description")}</VisuallyHidden.Root>
          </SheetDescription>
        </SheetHeader>
        <Options />
        <SheetFooter className="mt-auto flex-col sm:flex-col sm:space-x-0">
          {isSignedIn ? (
            <Logout handleLogout={handleLogout} />
          ) : (
            <Login handleLogin={handleLogin} />
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default SheetHamMenu;

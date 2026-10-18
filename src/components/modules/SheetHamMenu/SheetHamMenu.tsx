"use client";

import type { PropsWithChildren } from "react";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useLocale } from "next-intl";

import Login from "@/components/structures/Auth/Login";
import Logout from "@/components/structures/Auth/Logout";
import Options from "@/components/structures/SheetHamMenu/Options";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";
import Skeleton from "@/components/ui/Skeleton";

import { PATH_NAMES } from "@/utils/constants/pathnames";

type Props = {};

const Ham = dynamic(() => import("@/components/structures/share/Ham"), {
  ssr: false,
  loading: () => <Skeleton classes="h-8 w-12" />,
});

function SheetHamMenu({ children }: PropsWithChildren<Props>) {
  const router = useRouter();
  const path = usePathname();
  const locale = useLocale();
  const { status } = useSession();

  function handleLogout() {
    signOut({
      callbackUrl: PATH_NAMES.HOME,
      redirect: true,
    });
  }

  function handleLogin() {
    router.push(`/${locale}${PATH_NAMES.LOGIN}?redirect=${path}`);
  }
  return (
    <Sheet>
      <SheetTrigger>
        <Ham />
      </SheetTrigger>
      <SheetContent
        aria-describedby={"main menu"}
        side="left"
        className="isolate bg-surface/90 shadow-2xl backdrop-blur-md"
      >
        <SheetHeader>
          <SheetTitle>{children}</SheetTitle>
          <SheetDescription>
            <VisuallyHidden.Root>
              This is the main menu, you can navigate to different sections of the app.
            </VisuallyHidden.Root>
          </SheetDescription>
        </SheetHeader>
        <Options />
        <SheetFooter>
          <SheetClose asChild>
            <>
              {status === "authenticated" ? (
                <Logout handleLogout={handleLogout} />
              ) : (
                <Login handleLogin={handleLogin} />
              )}
            </>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default SheetHamMenu;

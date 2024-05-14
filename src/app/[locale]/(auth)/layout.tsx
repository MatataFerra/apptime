import { ReactElement } from "react";

import { headers } from "next/headers";

import ut from "@/services/Utilities";
import utClient from "@/services/Utilities/client";

import LayoutDesktop from "@/components/Layout/LayoutDesktop";
import LayoutMobile from "@/components/Layout/LayoutMobile";
import Compatibility from "@/components/modules/Desktop/Compatibility";

export default async function AuthLayout({ children }: { children: ReactElement }) {
  const userAgent = headers().get("user-agent") ?? "";
  const isMobileHeader = ut.isMobile({ headers: userAgent });
  const isMobile = utClient.isTruthyValue(isMobileHeader);

  if (!isMobile) {
    return (
      <LayoutDesktop>
        <Compatibility />
      </LayoutDesktop>
    );
  }

  return <LayoutMobile>{children}</LayoutMobile>;
}

import { headers } from "next/headers";

import ut from "@/services/Utilities";
import utClient from "@/services/Utilities/client";

import LayoutMobile from "@/components/Layout/LayoutMobile";
import Compatibility from "@/components/modules/Desktop/Compatibility";

export default async function AuthLayout({ children }: LayoutProps<"/[locale]">) {
  const userAgent = (await headers()).get("user-agent") ?? "";
  const isMobileHeader = ut.isMobile({ headers: userAgent });
  const isMobile = utClient.isTruthyValue(isMobileHeader);

  if (!isMobile) {
    return <Compatibility />;
  }

  return <LayoutMobile>{children}</LayoutMobile>;
}

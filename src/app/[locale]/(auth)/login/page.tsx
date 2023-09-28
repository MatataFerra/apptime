import ut from "@/services/Utilities/client";

import LoginScreen from "@/modules/login";
import ScreenDetector from "@/modules/screen-detector";
import LayoutDesktop from "@/components/Layout/LayoutDesktop";
import LayoutMobile from "@/components/Layout/LayoutMobile";

export default async function Login({
  searchParams,
}: {
  searchParams?: { callbackUrl: string | undefined };
}) {
  const param = searchParams?.callbackUrl?.split("?")[1].split("=")[1];
  // const param = "true";
  const isMobile = ut.isTrutyValue(param);

  if (!isMobile) {
    return (
      <LayoutDesktop>
        <ScreenDetector />
      </LayoutDesktop>
    );
  }

  return (
    <LayoutMobile>
      <LoginScreen />
    </LayoutMobile>
  );
}

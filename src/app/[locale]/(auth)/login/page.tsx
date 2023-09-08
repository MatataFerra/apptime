import { ut } from "@/services";

import { ScreenDetector } from "@/modules";
import LoginScreen from "@/modules/login";

export default async function Login({ searchParams }: { searchParams: { callbackUrl: string } }) {
  const param = searchParams.callbackUrl.split("?")[1].split("=")[1];
  const isMobile = ut.isTrutyValue(param);

  if (!isMobile) {
    return <ScreenDetector />;
  }

  return <LoginScreen />;
}

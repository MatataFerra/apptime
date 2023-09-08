import { headers } from "next/headers";

import { ut } from "@/services";

import { ScreenDetector } from "@/modules";
import LoginScreen from "@/modules/login";

export default async function Login() {
  const isMobile = ut.isMobile({ headers: headers().get("user-agent") ?? "" });
  if (!isMobile) {
    return <ScreenDetector />;
  }

  return <LoginScreen />;
}

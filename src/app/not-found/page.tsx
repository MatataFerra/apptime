import { headers } from "next/headers";
import { redirect } from "next/navigation";

import UserService from "@/services/User";
import ut from "@/services/Utilities";
import utClient from "@/services/Utilities/client";

import { PATH_NAMES } from "@/utils/constants/pathnames";

export default async function NotFound() {
  const user = await UserService.getSessionUser();
  const userAgent = headers().get("user-agent") ?? "";
  const isMobileHeader = ut.isMobile({ headers: userAgent });
  const isMobile = utClient.isTruthyValue(isMobileHeader);

  if (!isMobile) {
    return redirect(PATH_NAMES.NO_MOBILE);
  }

  if (process.env.STAGING === "false") {
    return redirect(PATH_NAMES.HOME);
  }

  if (process.env.STAGING === "true" && user?.role === "ADMIN") {
    return redirect(PATH_NAMES.HOME);
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-900 text-center">
      <div className="text-white">
        <h1 className="text-4xl font-bold">Coming Soon</h1>
        <p className="mt-4 text-lg">We are working on something awesome!</p>
      </div>
    </div>
  );
}

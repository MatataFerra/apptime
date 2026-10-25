import type { PropsWithChildren, ReactNode } from "react";

import isEmpty from "lodash/isEmpty";
import { redirect } from "next/navigation";

import UserService from "@/services/User";

import { PATH_NAMES } from "@/utils/constants/pathnames";

export default async function TokenLayout({
  children,
  password,
}: PropsWithChildren<{ password: ReactNode }>) {
  const user = await UserService.getSessionOwner();

  if (!isEmpty(user)) {
    return redirect(PATH_NAMES.HOME);
  }

  return (
    <>
      {password}
      {children}
    </>
  );
}

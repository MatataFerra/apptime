import { ReactElement } from "react";

import { notFound, redirect } from "next/navigation";

import UserService from "@/services/User";
import ut from "@/services/Utilities/client";

import DrawerMenu from "@/components/DrawerMenu";
import DrawerUserInfo from "@/components/DrawerUserInfo";
import Ham from "@/components/Ham";
import Header from "@/components/ui/Header";

interface Props {
  children: ReactElement;
  params: {
    locale: string;
  };
}

export default async function HomeLayout({ children, params }: Props) {
  const user = await UserService.getSessionUser();

  if (!user) {
    redirect(`/${params.locale}/login`);
  }

  if ((!user?.role || user?.role !== "ADMIN") && ut.toBool(process.env.STAGING)) {
    return notFound();
  }
  return (
    <>
      <main className="grid h-[100dvh] grid-rows-[auto,1fr] gap-8 p-4">
        <Header position="between">
          <Ham />
        </Header>
        <DrawerMenu>
          <DrawerUserInfo />
        </DrawerMenu>
        {children}
      </main>
    </>
  );
}

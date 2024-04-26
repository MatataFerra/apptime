import { ReactElement } from "react";

import dynamic from "next/dynamic";
import { notFound, redirect } from "next/navigation";

import UserService from "@/services/User";
import ut from "@/services/Utilities/client";

import DrawerUserInfo from "@/components/DrawerUserInfo";
import Ham from "@/components/Ham";
import Header from "@/components/ui/Header";

const DynamicDrawer = dynamic(() => import("@/components/DrawerMenu"), {
  ssr: false,
});

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
        <Header position="between" classes="relative">
          <Ham />
          <DynamicDrawer>
            <DrawerUserInfo />
          </DynamicDrawer>
        </Header>
        {children}
      </main>
    </>
  );
}

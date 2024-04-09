import { ReactElement } from "react";

import dynamic from "next/dynamic";
import { notFound, redirect } from "next/navigation";

import UserService from "@/services/User";
import ut from "@/services/Utilities/client";

import Header from "@/components/ui/Header";
import Skeleton from "@/components/ui/Skeleton";

const Drawer = dynamic(() => import("@/components/DrawerMenu"), { ssr: false });
const DrawerUserInfo = dynamic(() => import("@/components/DrawerUserInfo"), { ssr: false });
const Ham = dynamic(() => import("@/components/Ham"), {
  ssr: false,
  loading: () => <Skeleton classes="h-10 w-20" />,
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
        <Header position="between">
          <Ham />
        </Header>
        <Drawer>
          <DrawerUserInfo />
        </Drawer>
        {children}
      </main>
    </>
  );
}

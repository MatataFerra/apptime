import { ReactElement } from "react";

import dynamic from "next/dynamic";
import { notFound, redirect } from "next/navigation";

import UserService from "@/services/User";
import ut from "@/services/Utilities/client";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

const DynamicDrawer = dynamic(() => import("@/components/DrawerMenu"), {
  ssr: false,
});

const DrawerUserInfo = dynamic(() => import("@/components/DrawerUserInfo"), {
  ssr: false,
});

const Header = dynamic(() => import("@/components/ui/Header"), {
  ssr: false,
  loading: () => (
    <Stack orientation="horizontal">
      <Skeleton classes="h-10 w-20" />
      <Skeleton classes="w-50 h-10" />
    </Stack>
  ),
});

const Ham = dynamic(() => import("@/components/Ham"), {
  ssr: false,
  loading: () => <Skeleton classes="h-10 w-10" />,
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

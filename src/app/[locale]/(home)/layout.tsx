import { HydrationBoundary } from "@tanstack/react-query";

import { prefetchUserData } from "@/services/Prefetch";

import ModuleShell from "@/components/Layout/ModuleShell";
import SheetHamMenu from "@/components/modules/SheetHamMenu/SheetHamMenu";
import UserInfo from "@/components/structures/SheetHamMenu/UserInfo";
import Header from "@/components/ui/Header";

export default async function HomeLayout({ children }: LayoutProps<"/[locale]">) {
  // Runs on full page loads; client-side navigation keeps the layout and its cache.
  const { profile, state } = await prefetchUserData();

  return (
    <ModuleShell
      header={
        <Header
          position="between"
          classes="sticky top-0 z-10 h-16 bg-(--band) pb-0! transition-colors"
        >
          <SheetHamMenu>
            <UserInfo user={profile} />
          </SheetHamMenu>
        </Header>
      }
    >
      <HydrationBoundary state={state}>{children}</HydrationBoundary>
    </ModuleShell>
  );
}

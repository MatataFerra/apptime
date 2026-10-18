import ModuleShell from "@/components/Layout/ModuleShell";

import { Header,SheetHamMenu, UserInfo } from "./lazy";

export default async function HomeLayout({ children }: LayoutProps<"/[locale]">) {
  return (
    <ModuleShell
      header={
        <Header
          position="between"
          classes="sticky top-0 z-10 h-16 bg-(--band) pb-0! transition-colors"
        >
          <SheetHamMenu>
            <UserInfo />
          </SheetHamMenu>
        </Header>
      }
    >
      {children}
    </ModuleShell>
  );
}

import type { PropsWithChildren, ReactNode } from "react";

export default async function StartLayout({ children }: PropsWithChildren<{ button: ReactNode }>) {
  return <>{children}</>;
}

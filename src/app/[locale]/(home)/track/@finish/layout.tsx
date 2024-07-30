import type { PropsWithChildren, ReactNode } from "react";

export default async function FinishLayout({ children }: PropsWithChildren<{ button: ReactNode }>) {
  return <>{children}</>;
}

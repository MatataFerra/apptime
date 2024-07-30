import type { PropsWithChildren, ReactNode } from "react";

export default async function LayoutScreen({
  children,
}: PropsWithChildren<{ tracker: ReactNode }>) {
  return <>{children}</>;
}

import type { PropsWithChildren, ReactNode } from "react";

export default async function FinishLayout({
  button,
  children,
}: PropsWithChildren<{ button: ReactNode }>) {
  return (
    <>
      {children}
      {button}
    </>
  );
}

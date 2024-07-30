import type { PropsWithChildren, ReactNode } from "react";

export default async function StartLayout({
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

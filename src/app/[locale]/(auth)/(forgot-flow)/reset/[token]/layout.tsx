import type { PropsWithChildren, ReactNode } from "react";

export default async function TokenLayout({
  children,
  password,
}: PropsWithChildren<{ password: ReactNode }>) {
  return (
    <>
      {password}
      {children}
    </>
  );
}

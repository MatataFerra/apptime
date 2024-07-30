import { PropsWithChildren, ReactNode } from "react";

export default async function TrackerLayout({
  children,
  finish,
}: PropsWithChildren<{ finish: ReactNode; start: ReactNode }>) {
  return (
    <>
      {children}
      {finish}
    </>
  );
}

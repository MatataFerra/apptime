import type { ReactNode } from "react";

export default async function TableLayout({
  children,
  history,
}: {
  children: ReactNode;
  history: ReactNode;
}) {
  return (
    <>
      {children}
      {history}
    </>
  );
}

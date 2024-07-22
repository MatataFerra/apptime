import type { PropsWithChildren, ReactElement } from "react";

interface TableLayoutProps {
  history: ReactElement;
}

export default async function TableLayout({
  children,
  history,
}: PropsWithChildren<TableLayoutProps>) {
  return (
    <>
      {children}
      {history}
    </>
  );
}

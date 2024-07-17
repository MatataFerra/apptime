import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  table: ReactNode;
  charts: ReactNode;
};

export default function Layout({ children, table, charts }: Props) {
  return (
    <>
      {children}
      {table}
      {charts}
    </>
  );
}

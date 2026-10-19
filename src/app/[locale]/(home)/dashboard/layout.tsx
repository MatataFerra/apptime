import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  table: ReactNode;
  charts: ReactNode;
};

export default function Layout({ children, table, charts }: Props) {
  return (
    <div className="flex flex-col gap-8">
      {children}
      {charts}
      {table}
    </div>
  );
}

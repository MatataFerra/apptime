import type { ReactNode } from "react";

export default async function TableLayout({
  children,
  history,
}: {
  children: ReactNode;
  history: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3" aria-label="History">
      {children}
      {history}
    </section>
  );
}

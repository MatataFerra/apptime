import type { ReactNode } from "react";

import { getTranslations } from "next-intl/server";

export default async function TableLayout({
  children,
  history,
}: {
  children: ReactNode;
  history: ReactNode;
}) {
  const t = await getTranslations("dashboard.history");

  return (
    <section className="flex flex-col gap-3" aria-label={t("title")}>
      {children}
      {history}
    </section>
  );
}

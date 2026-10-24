import { getTranslations } from "next-intl/server";

export default async function Page() {
  const t = await getTranslations("admin");

  return <h1>{t("title")}</h1>;
}

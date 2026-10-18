import { redirect } from "next/navigation";

import Content from "@/components/modules/Home/Content";

import { PATH_NAMES } from "@/utils/constants/pathnames";
import { isLocale } from "@/utils/helpers/locale";

export const dynamic = "force-static";
export const revalidate = 86400;

export default async function Home(props: PageProps<"/[locale]">) {
  const { locale } = await props.params;

  if (!isLocale(locale)) {
    return redirect(PATH_NAMES.HOME);
  }

  return <Content params={{ locale }} />;
}

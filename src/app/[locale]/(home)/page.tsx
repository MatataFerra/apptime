import { redirect } from "next/navigation";

import Content from "@/components/modules/Home/Content";

import { PATH_NAMES } from "@/utils/constants/pathnames";
import { isLocale } from "@/utils/helpers/locale";

export default async function Home(props: PageProps<"/[locale]">) {
  const { locale } = await props.params;

  if (!isLocale(locale)) {
    return redirect(PATH_NAMES.HOME);
  }

  return <Content />;
}

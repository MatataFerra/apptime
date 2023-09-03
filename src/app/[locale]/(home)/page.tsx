import { ut } from "@/services";
import i18n from "@/services/i18n";

import { LocaleParams } from "@/types";

import { Text } from "@/components";

import { PATH_NAMES } from "@/utils/constants";

export default async function Home({ params }: { params: LocaleParams }) {
  const isLocaleSupported = new i18n(params.locale).isLocaleSupported();

  if (!isLocaleSupported) {
    return ut.redirectTo(PATH_NAMES.HOME);
  }

  return (
    <main className="flex h-[100dvh] flex-col items-center justify-center p-2">
      <Text>Screen compatibility HOME</Text>
    </main>
  );
}

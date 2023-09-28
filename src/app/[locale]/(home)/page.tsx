import i18n from "@/services/i18n";
import ut from "@/services/Utilities/client";

import { LocaleParams } from "@/types";

import HomeModule from "@/modules/home";
import Text from "@/components/Text";

import { PATH_NAMES } from "@/utils/constants/pathnames";

export default async function Home({ params }: { params: LocaleParams }) {
  const isLocaleSupported = new i18n(params.locale).isLocaleSupported();

  if (!isLocaleSupported) {
    return ut.redirectTo(PATH_NAMES.HOME);
  }

  return (
    <main className="flex h-[100dvh] flex-col items-center justify-center p-2">
      <Text variant="error" classes="mb-4">
        Logout de la app ya que todavía no está implementada la home
      </Text>
      <HomeModule />
    </main>
  );
}

import { getTranslations } from "next-intl/server";

import ModuleTitle from "@/components/structures/share/ModuleTitle";

import { PATH_NAMES } from "@/utils/constants/pathnames";

import { AppearanceSection, GoalSection, MoneySection, ProfileCard, WorkSection } from "./lazy";

export default async function BodyPage() {
  const t = await getTranslations();

  return (
    <>
      <ModuleTitle module={PATH_NAMES.SETTINGS} title={t("modules.settings.title")} />
      <ProfileCard />
      <AppearanceSection />
      <MoneySection />
      <WorkSection />
      <GoalSection />
    </>
  );
}

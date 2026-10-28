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
      <h2 className="-mb-2 px-1 text-sm font-semibold text-ink-muted">
        {t("settings.details.title")}
      </h2>
    </>
  );
}

import ModuleTitle from "@/components/structures/share/ModuleTitle";

import { PATH_NAMES } from "@/utils/constants/pathnames";

import { AppearanceSection, MoneySection, ProfileCard } from "./lazy";

export default async function BodyPage() {
  return (
    <>
      <ModuleTitle module={PATH_NAMES.SETTINGS} title="Settings" />
      <ProfileCard />
      <AppearanceSection />
      <MoneySection />
      <h2 className="-mb-2 px-1 text-sm font-semibold text-ink-muted">Your details</h2>
    </>
  );
}

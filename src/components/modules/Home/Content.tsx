import { useTranslations } from "next-intl";

import MainModules from "@/components/structures/Home/MainModules";
import MainOptions from "@/components/structures/Home/MainOptions";

import { HomeHeader, LiveShift, RepeatFastCharge, WeekSummary } from "./Content.lazy";

function Content() {
  const t = useTranslations("home");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <HomeHeader />
        <LiveShift />
        <RepeatFastCharge />
        <WeekSummary />
      </div>
      <nav className="flex w-full flex-col gap-6" aria-label={t("sections.modules")}>
        <MainModules />
        <MainOptions />
      </nav>
    </div>
  );
}

export default Content;

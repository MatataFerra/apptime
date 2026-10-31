import { Suspense } from "react";

import { useTranslations } from "next-intl";

import HomeHeader from "@/components/structures/Home/HomeHeader";
import MainModules from "@/components/structures/Home/MainModules";
import MainOptions from "@/components/structures/Home/MainOptions";
import WeekSummary from "@/components/structures/Home/WeekSummary";
import Skeleton from "@/components/ui/Skeleton";

import { EarningsGoal, LiveShift, RepeatFastCharge } from "./Content.lazy";

function Content() {
  const t = useTranslations("home");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Suspense
          fallback={
            <div className="flex flex-col gap-2 pt-2">
              <Skeleton classes="h-5 w-40" />
              <Skeleton classes="h-[4.5rem] w-24" />
            </div>
          }
        >
          <HomeHeader />
        </Suspense>
        <LiveShift />
        <RepeatFastCharge />
        <Suspense fallback={<Skeleton classes="h-80 w-full rounded-xl" />}>
          <WeekSummary />
        </Suspense>
        <EarningsGoal />
      </div>
      <nav className="flex w-full flex-col gap-6" aria-label={t("sections.modules")}>
        <MainModules />
        <MainOptions />
      </nav>
    </div>
  );
}

export default Content;

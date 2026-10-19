import { type LocaleParams } from "@/types";

import MainModules from "@/components/structures/Home/MainModules";
import MainOptions from "@/components/structures/Home/MainOptions";

import { HomeHeader, LiveShift, RepeatFastCharge, WeekSummary } from "./Content.lazy";

type Props = {
  params: LocaleParams;
};

function Content({ params }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <HomeHeader locale={params.locale} />
        <LiveShift />
        <RepeatFastCharge />
        <WeekSummary />
      </div>
      <nav className="flex w-full flex-col gap-6" aria-label="Modules">
        <MainModules />
        <MainOptions />
      </nav>
    </div>
  );
}

export default Content;

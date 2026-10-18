import dynamic from "next/dynamic";

import { type LocaleParams } from "@/types";

import MainModules from "@/components/structures/Home/MainModules";
import MainOptions from "@/components/structures/Home/MainOptions";
import Skeleton from "@/components/ui/Skeleton";

const HomeHeader = dynamic(() => import("@/components/structures/Home/HomeHeader"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col gap-2 pt-2">
      <Skeleton classes="h-4 w-36" />
      <Skeleton classes="h-16 w-20" />
    </div>
  ),
});

const WeekSummary = dynamic(() => import("@/components/structures/Home/WeekSummary"), {
  ssr: false,
  loading: () => <Skeleton classes="h-52 w-full rounded-2xl" />,
});

const LiveShift = dynamic(() => import("@/components/structures/Home/LiveShift"), {
  ssr: false,
});

type Props = {
  params: LocaleParams;
};

function Content({ params }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <HomeHeader locale={params.locale} />
        <LiveShift />
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

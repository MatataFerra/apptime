import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

import { PATH_NAMES } from "@/utils/constants/pathnames";

const HomeCardOption = dynamic(() => import("@/components/ui/OptionCard"), {
  ssr: false,
  loading: () => <Skeleton classes="m-3 h-10" />,
});

const MonthEarned = dynamic(() => import("@/components/structures/Home/MonthEarned"), {
  ssr: false,
});

function Options() {
  return (
    <div className="w-full divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
      <HomeCardOption title="Dashboard" path={PATH_NAMES.DASHBOARD} meta={<MonthEarned />} />
      <HomeCardOption
        title="Estimate"
        description="What a stretch of work pays"
        path={PATH_NAMES.INCOMES}
      />
      <HomeCardOption
        title="Compare"
        description="Per piece or per hour"
        path={PATH_NAMES.COMPARE}
      />
    </div>
  );
}

export default Options;

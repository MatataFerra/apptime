import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

import { PATH_NAMES } from "@/utils/constants/pathnames";

const HomeCardOption = dynamic(() => import("@/components/ui/OptionCard"), {
  ssr: false,
  loading: () => <Skeleton classes="m-3 h-14" />,
});

function Options() {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
      <HomeCardOption
        title="Dashboard"
        description="Hours and earnings over time"
        path={PATH_NAMES.DASHBOARD}
      />
      <HomeCardOption
        title="Incomes"
        description="What you take home after tax"
        path={PATH_NAMES.INCOMES}
      />
      <HomeCardOption
        title="Compare"
        description="Put two shifts side by side"
        path={PATH_NAMES.COMPARE}
      />
    </div>
  );
}

export default Options;

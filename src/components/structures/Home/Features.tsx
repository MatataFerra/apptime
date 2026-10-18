import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

import { PATH_NAMES } from "@/utils/constants/pathnames";

const HomeCardOption = dynamic(() => import("@/components/ui/OptionCard"), {
  ssr: false,
  loading: () => <Skeleton classes="m-3 h-14" />,
});

function Features() {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
      <HomeCardOption
        title="Track"
        description="Run the clock on an hourly shift"
        path={PATH_NAMES.TRACK}
      />
      <HomeCardOption
        title="Fast charge"
        description="Log a finished shift in one go"
        path={PATH_NAMES.FAST_CHARGE}
      />
      <HomeCardOption
        title="Production"
        description="Get paid per bin, box or piece"
        path={PATH_NAMES.PRODUCTION}
      />
    </div>
  );
}

export default Features;

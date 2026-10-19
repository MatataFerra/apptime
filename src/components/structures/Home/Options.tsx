import { PATH_NAMES } from "@/utils/constants/pathnames";

import { HomeCardOption, MonthEarned } from "./Options.lazy";

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

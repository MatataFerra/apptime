import { useTranslations } from "next-intl";

import { PATH_NAMES } from "@/utils/constants/pathnames";

import { HomeCardOption, MonthEarned } from "./Options.lazy";

function Options() {
  const t = useTranslations("modules");

  return (
    <div className="w-full divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
      <HomeCardOption
        title={t("dashboard.title")}
        path={PATH_NAMES.DASHBOARD}
        meta={<MonthEarned />}
      />
      <HomeCardOption
        title={t("estimate.title")}
        description={t("estimate.description")}
        path={PATH_NAMES.INCOMES}
      />
      <HomeCardOption
        title={t("compare.title")}
        description={t("compare.description")}
        path={PATH_NAMES.COMPARE}
      />
      <HomeCardOption
        title={t("taxes.title")}
        description={t("taxes.description")}
        path={PATH_NAMES.TAXES}
      />
      <HomeCardOption
        title={t("employers.title")}
        description={t("employers.description")}
        path={PATH_NAMES.EMPLOYERS}
      />
    </div>
  );
}

export default Options;

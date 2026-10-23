import { useTranslations } from "next-intl";

import Option from "@/components/structures/SheetHamMenu/Option";
import Title from "@/components/structures/SheetHamMenu/Title";

import { PATH_NAMES } from "@/utils/constants/pathnames";

type ModuleKey =
  | "track"
  | "fast_charge"
  | "production"
  | "employers"
  | "dashboard"
  | "estimate"
  | "compare"
  | "taxes"
  | "settings";

type DrawerOption = {
  id: string;
  module: ModuleKey;
  dataTestId: string;
  url: string;
};

const LOG_WORK: DrawerOption[] = [
  { id: "track-time", module: "track", dataTestId: "track-time", url: PATH_NAMES.TRACK },
  {
    id: "fast-charge",
    module: "fast_charge",
    dataTestId: "fast-charge",
    url: PATH_NAMES.FAST_CHARGE,
  },
  {
    id: "production-job",
    module: "production",
    dataTestId: "production-job",
    url: PATH_NAMES.PRODUCTION,
  },
  { id: "employers", module: "employers", dataTestId: "employers", url: PATH_NAMES.EMPLOYERS },
];

const MONEY: DrawerOption[] = [
  { id: "dashboard", module: "dashboard", dataTestId: "dashboard", url: PATH_NAMES.DASHBOARD },
  {
    id: "estimate-income",
    module: "estimate",
    dataTestId: "estimate-income",
    url: PATH_NAMES.INCOMES,
  },
  { id: "compare", module: "compare", dataTestId: "compare", url: PATH_NAMES.COMPARE },
  { id: "taxes", module: "taxes", dataTestId: "taxes", url: PATH_NAMES.TAXES },
];

const ACCOUNT: DrawerOption[] = [
  { id: "settings", module: "settings", dataTestId: "settings", url: PATH_NAMES.SETTINGS },
];

const GROUPS = [
  { key: "log_work", options: LOG_WORK },
  { key: "your_money", options: MONEY },
  { key: "account", options: ACCOUNT },
] as const;

function Options() {
  const t = useTranslations("nav");
  const tm = useTranslations("modules");

  return (
    <nav aria-label={t("main")} className="flex w-full flex-col gap-5">
      {GROUPS.map((group) => (
        <div key={group.key} className="flex flex-col gap-0.5">
          <Title title={t(`groups.${group.key}`)} />
          {group.options.map((option) => (
            <Option key={option.id} option={{ ...option, label: tm(`${option.module}.title`) }} />
          ))}
        </div>
      ))}
    </nav>
  );
}

export default Options;

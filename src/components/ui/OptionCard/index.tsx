"use client";

import { useRouter } from "next/navigation";

import { type CSSClassNames } from "@/types";

import Icon from "@/components/ui/Icons";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { PATH_NAMES } from "@/utils/constants/pathnames";

type Props = {
  title?: string;
  path?: string;
  classes?: CSSClassNames;
};

const ICONS = {
  [PATH_NAMES.FAST_CHARGE]: <Icon.lightning width={"100%"} height={"100%"} />,
  [PATH_NAMES.TRACK]: <Icon.clock width={"100%"} height={"100%"} />,
  [PATH_NAMES.PRODUCTION]: <Icon.box width={"100%"} height={"100%"} />,
  [PATH_NAMES.HISTORY_SHIFT]: <Icon.dashboard width={"100%"} height={"100%"} />,
  [PATH_NAMES.INCOMES]: <Icon.incomes width={"100%"} height={"100%"} />,
  [PATH_NAMES.COMPARE]: <Icon.compare width={"100%"} height={"100%"} />,
  default: <Icon.default width={"100%"} height={"100%"} className="animate-pulse duration-5000" />,
};

function OptionCard({ title, path, classes }: Props) {
  const router = useRouter();

  return (
    <Stack
      orientation="vertical"
      justifyContent="center"
      alignItems="center"
      as="div"
      onClick={() => router.push(path ?? PATH_NAMES.HOME)}
    >
      <Stack
        as="figure"
        justifyContent="center"
        alignItems="center"
        classes={`size-14 cursor-pointer rounded-lg p-2 shadow-input active:shadow-inner ${classes}`}
      >
        <div className={`size-fit`}>{ICONS[(path as keyof typeof ICONS) ?? "default"]}</div>
      </Stack>
      {title ? <Text classes="text-xs font-medium">{title}</Text> : null}
    </Stack>
  );
}

export default OptionCard;

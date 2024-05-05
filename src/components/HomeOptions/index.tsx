import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

import { PATH_NAMES } from "@/utils/constants/pathnames";

const HomeCardOption = dynamic(() => import("@/components/ui/OptionCard"), {
  ssr: false,
  loading: () => <Skeleton classes="size-full" />,
});

function HomeOptions() {
  return (
    <Stack alignItems="center" classes="w-full">
      <HomeCardOption classes="size-10" path={PATH_NAMES.HISTORY_SHIFT} />
      <HomeCardOption classes="size-10" path={PATH_NAMES.INCOMES} />
      <HomeCardOption classes="size-10" path={PATH_NAMES.COMPARE} />
      <HomeCardOption classes="size-10" />
    </Stack>
  );
}

export default HomeOptions;

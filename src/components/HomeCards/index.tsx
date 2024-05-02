import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

import { PATH_NAMES } from "@/utils/constants/pathnames";

const HomeCardOption = dynamic(() => import("@/components/HomeCardOption"), {
  ssr: false,
  loading: () => <Skeleton classes="size-full" />,
});

function HomeCards() {
  return (
    <Stack grid cols={3} spacing={4}>
      <HomeCardOption title="Fast" path={PATH_NAMES.FAST_CHARGE} />
      <HomeCardOption title="Track" path={PATH_NAMES.TRACK} />
      <HomeCardOption title="Production" path={PATH_NAMES.PRODUCTION} />
    </Stack>
  );
}

export default HomeCards;

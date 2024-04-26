import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

import { PATH_NAMES } from "@/utils/constants/pathnames";

const HomeCardOption = dynamic(() => import("@/components/HomeCardOption"), {
  ssr: false,
  loading: () => <Skeleton classes="h-full w-full" />,
});

function HomeCards() {
  return (
    <Stack classes="h-full w-full" orientation="vertical" spacing={4}>
      <HomeCardOption
        gradient={{ from: "from-teal-500", via: "via-sky-300", to: "to-blue-500" }}
        title="Fast Charge"
        path={PATH_NAMES.FAST_CHARGE}
        bgImage="bg-lightning"
      />

      <HomeCardOption
        gradient={{ from: "from-green-500", via: "via-lime-400", to: "to-emerald-400" }}
        title="Track your time"
        path={PATH_NAMES.TRACK}
        bgImage="bg-clock"
      />

      <HomeCardOption
        gradient={{ from: "from-red-500", via: "via-amber-400", to: "to-amber-400" }}
        title="Production Job"
        path={PATH_NAMES.PRODUCTION}
        bgImage="bg-box"
      />
    </Stack>
  );
}

export default HomeCards;

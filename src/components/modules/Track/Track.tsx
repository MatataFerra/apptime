import dynamic from "next/dynamic";

import UserService from "@/services/User";
import ut from "@/services/Utilities/client";

import HydrateStore from "@/components/structures/Track/HydrateStore";
import Skeleton from "@/components/ui/Skeleton";

import { PATH_NAMES } from "@/utils/constants/pathnames";

const FabMenu = dynamic(() => import("@/components/structures/Track/Fab"), {
  ssr: false,
  loading: () => <Skeleton classes="absolute bottom-36 right-2 size-20 rounded-full  p-2" />,
});

async function Track() {
  const user = await UserService.getSessionUser();

  if (!user) {
    return ut.redirectTo(PATH_NAMES.LOGIN);
  }
  return (
    <>
      <HydrateStore data={{ user }}>
        <FabMenu />
      </HydrateStore>
    </>
  );
}

export default Track;

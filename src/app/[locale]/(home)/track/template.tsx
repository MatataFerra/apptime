import type { PropsWithChildren } from "react";

import UserService from "@/services/User";

import HydrateStore from "@/components/structures/Track/HydrateStore";

export default async function Template({ children }: PropsWithChildren) {
  const user = await UserService.getSessionUser();
  return <HydrateStore data={{ user }}>{children}</HydrateStore>;
}

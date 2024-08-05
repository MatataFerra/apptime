"use client";

import type { PropsWithChildren } from "react";

import HydrateStore from "@/components/structures/Track/HydrateStore";

import useUser from "@/hooks/useUser";

export default function Template({ children }: PropsWithChildren) {
  const { data: user } = useUser();

  return <HydrateStore data={{ user }}>{children}</HydrateStore>;
}

"use client";

import { PropsWithChildren, useEffect } from "react";

import { useRouter } from "next/navigation";

import UserService from "@/services/User";

import HydrateStore from "@/components/structures/Track/HydrateStore";

import useUser from "@/hooks/useUser";

export default function Template({ children }: PropsWithChildren) {
  const { data: user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) router.refresh();
  }, [isLoading, router]);

  return <HydrateStore data={{ user }}>{children}</HydrateStore>;
}

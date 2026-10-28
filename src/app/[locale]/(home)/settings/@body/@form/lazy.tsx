"use client";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

/**
 * "Your details" only on the client, like the other Settings sections: its
 * fields show a skeleton until the user loads, and on the server the user
 * is never loaded while on the client it often already is (cached by the
 * sections above), so rendering it on the server wouldn't match.
 */
export const SettingsForm = dynamic(() => import("@/components/modules/Settings/Form"), {
  ssr: false,
  loading: () => <Skeleton classes="h-64 w-full rounded-xl" />,
});

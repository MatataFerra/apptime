import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

const ButtonsStart = dynamic(() => import("@/components/modules/Track/Flow/Start/Button"), {
  ssr: false,
  loading: () => <Skeleton classes="h-18 w-full" />,
});

export const maxDuration = 15;

export default function ButtonsPage() {
  return <ButtonsStart />;
}

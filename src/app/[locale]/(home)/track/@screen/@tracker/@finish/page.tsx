import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

const ButtonFinish = dynamic(() => import("@/components/modules/Track/Flow/Finish/Button"), {
  ssr: false,
  loading: () => <Skeleton classes="h-12 w-full" />,
});

export const maxDuration = 15;

export default function FinishButtonPage() {
  return <ButtonFinish />;
}

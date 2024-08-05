import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

const ButtonFinish = dynamic(() => import("@/components/modules/Track/Flow/Finish/Button"), {
  ssr: true,
  loading: () => <Skeleton classes="h-12 w-full" />,
});

export default function FinishButtonPage() {
  return <ButtonFinish />;
}

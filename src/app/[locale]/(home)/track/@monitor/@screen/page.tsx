import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

const State = dynamic(() => import("@/components/structures/Track/State"), {
  ssr: false,
  loading: () => <Skeleton classes="h-12 w-1/3" />,
});

export default async function ScreenPage() {
  return <State />;
}

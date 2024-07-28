import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

const Drawer = dynamic(() => import("@/components/modules/FastCharge/Drawer"), {
  ssr: false,
  loading: () => <Skeleton classes="h-12 w-full" />,
});

export default async function DrawerPage() {
  return <Drawer />;
}

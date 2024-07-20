import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

const FabMenu = dynamic(() => import("@/components/structures/Track/Fab"), {
  ssr: false,
  loading: () => <Skeleton classes="absolute bottom-36 right-2 size-20 rounded-full  p-2" />,
});

async function Fab() {
  return <FabMenu />;
}

export default Fab;

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

const Content = dynamic(() => import("@/components/structures/Dashboard/Chart/Content"), {
  ssr: false,
  loading: () => <Skeleton classes="mx-auto mt-8 h-full w-full" />,
});

function CarouselChart() {
  return (
    <Stack classes="mx-auto mt-8 h-fit w-full">
      <Content />
    </Stack>
  );
}

export default CarouselChart;

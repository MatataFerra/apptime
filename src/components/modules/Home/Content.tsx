import dynamic from "next/dynamic";

import { type LocaleParams, type UserType } from "@/types";

import Line from "@/components/ui/Line";
import Skeleton from "@/components/ui/Skeleton";

const Stack = dynamic(() => import("@/components/ui/Stack"), {
  ssr: false,
});

const Title = dynamic(() => import("@/components/structures/share/Title"), {
  ssr: false,
  loading: () => (
    <Stack as="div" orientation="vertical" spacing={4}>
      <Skeleton classes="h-12 w-60" />
      <Skeleton classes="h-12 w-28" />
    </Stack>
  ),
});

const TodayDate = dynamic(() => import("@/components/structures/share/TodayDate"), {
  ssr: false,
  loading: () => <Skeleton classes="h-4 w-44" />,
});

const MainModules = dynamic(() => import("@/components/structures/Home/MainModules"), {
  ssr: false,
  loading: () => (
    <>
      <Stack classes="size-full" orientation="vertical" spacing={4}>
        <Skeleton classes="size-full" />
        <Skeleton classes="size-full" />
        <Skeleton classes="size-full" />
      </Stack>
    </>
  ),
});

const MainOptions = dynamic(() => import("@/components/structures/Home/MainOptions"), {
  ssr: false,
  loading: () => (
    <Stack alignItems="center" classes="w-full" spacing={4}>
      <Skeleton classes="size-5" />
      <Skeleton classes="size-5" />
      <Skeleton classes="size-5" />
    </Stack>
  ),
});

type Props = {
  params: LocaleParams;
};

function Content({ params }: Props) {
  return (
    <Stack orientation="vertical" spacing={8}>
      <Stack as="div" orientation="vertical" spacing={4}>
        <Title />
        <TodayDate locale={params.locale} />
      </Stack>
      <Line color="bg-stone-300" />
      <Stack as="menu" orientation="vertical" classes="w-full p-2" spacing={8}>
        <MainModules />
        <MainOptions />
      </Stack>
    </Stack>
  );
}

export default Content;

import dynamic from "next/dynamic";

import { type LocaleParams, type UserType } from "@/types";

import Skeleton from "@/components/ui/Skeleton";

const Stack = dynamic(() => import("@/components/ui/Stack"), {
  ssr: false,
});

const Title = dynamic(() => import("@/components/structures/share/Title"), {
  ssr: false,
  loading: () => (
    <Stack as="div" orientation="vertical" spacing={4}>
      <Skeleton classes="h-4 w-28" />
      <Skeleton classes="h-10 w-48" />
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
      <Skeleton classes="h-52 w-full rounded-lg" />
    </>
  ),
});

const MainOptions = dynamic(() => import("@/components/structures/Home/MainOptions"), {
  ssr: false,
  loading: () => <Skeleton classes="h-52 w-full rounded-lg" />,
});

type Props = {
  params: LocaleParams;
};

function Content({ params }: Props) {
  return (
    <Stack orientation="vertical" spacing={8} classes="pt-2">
      <Stack as="div" orientation="vertical" spacing={2}>
        <Title />
        <TodayDate locale={params.locale} />
      </Stack>
      <Stack as="nav" orientation="vertical" classes="w-full" spacing={8}>
        <MainModules />
        <MainOptions />
      </Stack>
    </Stack>
  );
}

export default Content;

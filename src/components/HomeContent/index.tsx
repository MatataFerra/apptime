import dynamic from "next/dynamic";

import { type LocaleParams,type UserType } from "@/types";

import Line from "@/components/ui/Line";
import Skeleton from "@/components/ui/Skeleton";
import Text from "@/components/ui/Text";

const Stack = dynamic(() => import("@/components/ui/Stack"), {
  ssr: false,
});

const WelcomeTitle = dynamic(() => import("@/components/WelcomeTitle"), {
  ssr: false,
  loading: () => (
    <Stack as="div" orientation="vertical" spacing={4}>
      <Skeleton classes="h-12 w-60" />
      <Skeleton classes="h-12 w-28" />
    </Stack>
  ),
});

const DateComponent = dynamic(() => import("@/components/Date"), {
  ssr: false,
  loading: () => <Skeleton classes="h-4 w-44" />,
});

const HomeMainFeatures = dynamic(() => import("@/components/HomeMainFeatures"), {
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

const HomeOptions = dynamic(() => import("@/components/HomeOptions"), {
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
  user?: UserType | null;
  params: LocaleParams;
};

function HomeContent({ user, params }: Props) {
  return (
    <Stack orientation="vertical" spacing={8}>
      <Stack as="div" orientation="vertical" spacing={4}>
        <WelcomeTitle user={user} />
        <DateComponent locale={params.locale} />
      </Stack>
      <Line color="bg-stone-300" />
      <Stack as="menu" orientation="vertical" classes="w-full p-2" spacing={8}>
        <Stack orientation="vertical">
          <Text variant="subtitle" classes="text-center text-lg">
            Main modules
          </Text>
          <HomeMainFeatures />
        </Stack>
        {/* <Line color="bg-stone-300" /> */}
        <Stack orientation="vertical" classes="w-full">
          <Text classes="text-center text-xs">Shortcuts</Text>
          <HomeOptions />
        </Stack>
      </Stack>
    </Stack>
  );
}

export default HomeContent;

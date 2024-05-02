import dynamic from "next/dynamic";

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

const HomeCards = dynamic(() => import("@/components/HomeCards"), {
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

type Props = {
  user: any;
  params: any;
};

function HomeContent({ user, params }: Props) {
  return (
    <Stack orientation="vertical" spacing={8}>
      <Stack as="div" orientation="vertical" spacing={4}>
        <WelcomeTitle user={user} />
        <DateComponent locale={params.locale} />
      </Stack>
      <Line color="bg-stone-300" />
      <Stack orientation="vertical">
        <Text variant="subtitle" classes="text-center text-xs">
          Start with a module
        </Text>
        <HomeCards />
      </Stack>
    </Stack>
  );
}

export default HomeContent;

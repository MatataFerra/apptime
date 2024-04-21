import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

export default function LoadingTrack() {
  return (
    <>
      <Stack orientation="vertical" spacing={8}>
        <Stack as="div" orientation="vertical" spacing={4}>
          <Stack as="div" orientation="vertical" spacing={4}>
            <Skeleton classes="h-12 w-60" />
            <Skeleton classes="h-12 w-28" />
          </Stack>
          <Skeleton classes="h-4 w-44" />
        </Stack>
        <Stack orientation="vertical" classes="w-full" spacing={8}>
          <Skeleton classes="h-8 w-1/3" />
          <Skeleton classes="h-[25dvh] w-full" />
        </Stack>
        <Stack classes="h-full w-full" spacing={10} alignItems="center" justifyContent="between">
          <Skeleton classes="h-12 w-full" />
          <Skeleton classes="h-12 w-full" />
        </Stack>
      </Stack>
    </>
  );
}
